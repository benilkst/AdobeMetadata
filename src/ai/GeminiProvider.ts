import { GoogleGenAI } from '@google/genai';
import { AIProvider, MetadataInput, ValidationInput } from './AIProvider';
import { AssetInput, VisualAnalysis, StockMetadata, ValidationResult, ExtensionSettings } from '../types';
import { VISUAL_ANALYSIS_SYSTEM_INSTRUCTION, VISUAL_ANALYSIS_USER_PROMPT } from './prompts/visualAnalysisPrompt';
import { METADATA_GENERATION_SYSTEM_INSTRUCTION, ADOBE_STOCK_CATEGORIES } from './prompts/metadataPrompt';
import { calculateQualityScore } from '../compliance/qualityScorer';
import { fileToBase64, getOptimizedImageBase64 } from '../utils/fileHelpers';
import { buildMetadataFromAnalysis } from '../metadata/metadataGenerator';
import { analyzeVideoAsset } from '../analysis/videoAnalyzer';

async function callWithRetry<T>(fn: () => Promise<T>, maxRetries = 2, delayMs = 1200): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const msg = err?.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
      const isRetryable =
        msg.includes('500') ||
        msg.includes('Network error') ||
        msg.includes('overloaded') ||
        msg.includes('503') ||
        msg.includes('RESOURCE_EXHAUSTED') ||
        msg.includes('429');
      if (!isRetryable || attempt === maxRetries) {
        throw err;
      }
      await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
    }
  }
  throw lastError;
}

export class GeminiProvider implements AIProvider {
  readonly id = 'gemini';
  readonly name = 'Google Gemini Vision';

  isConfigured(settings: ExtensionSettings): boolean {
    return !!(
      settings.geminiApiKey?.trim() ||
      (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
      (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY)
    );
  }

  getEffectiveApiKey(settings: ExtensionSettings): string {
    const configured = settings.geminiApiKey?.trim();
    if (configured) return configured;
    if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) {
      return (import.meta as any).env.VITE_GEMINI_API_KEY;
    }
    if (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) {
      return process.env.GEMINI_API_KEY;
    }
    return '';
  }

  async testConnection(apiKey: string, modelName = 'gemini-3.8-flash'): Promise<{ success: boolean; message: string }> {
    const key = apiKey.trim();
    if (!key) {
      return { success: false, message: 'Please enter a Gemini API Key to test.' };
    }
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: modelName,
        contents: 'Ping: Respond with "OK" to confirm connectivity.',
      });
      if (response.text?.length) {
        return { success: true, message: `Connected to ${modelName} successfully!` };
      }
      return { success: true, message: `API key verified with ${modelName}.` };
    } catch (err: any) {
      console.error('Connection test error:', err);
      const msg = err?.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
      if (msg.includes('API_KEY_INVALID') || msg.includes('403') || msg.includes('API key not valid')) {
        return {
          success: false,
          message: 'Invalid API Key format. Google AI Studio keys typically start with "AIzaSy...".',
        };
      }
      if (msg.includes('500') || msg.includes('Network error')) {
        return {
          success: false,
          message: 'Google Gemini service returned a network error (500). Verify key at aistudio.google.com/apikey.',
        };
      }
      if (msg.includes('NOT_FOUND') || msg.includes('404')) {
        return { success: false, message: `Model "${modelName}" not available for this key.` };
      }
      return { success: false, message: msg };
    }
  }

  async analyzeImage(asset: AssetInput, settings: ExtensionSettings): Promise<VisualAnalysis> {
    const apiKey = this.getEffectiveApiKey(settings);
    if (!apiKey) {
      throw new Error(
        'Gemini API Key is not configured. Please open Settings (⚙️) and enter your Gemini API Key.'
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Client-side downscaling and compression: 12MB+ images become ~250KB JPEG
    // Drastically lowers token usage from ~30k to ~258 tokens, avoiding 429 TPM limits
    let cleanBase64 = '';
    let mimeType = asset.type || 'image/jpeg';
    if (asset.file) {
      try {
        const optimized = await getOptimizedImageBase64(asset.file, 1536, 0.85);
        cleanBase64 = optimized.base64;
        mimeType = optimized.mimeType;
      } catch (optErr) {
        console.warn('Image optimization fallback:', optErr);
      }
    }
    if (!cleanBase64) {
      const fullBase64 = asset.base64 || (await fileToBase64(asset.file));
      cleanBase64 = fullBase64.replace(/^data:[^;]+;base64,/, '');
    }

    const preferredModel = settings.geminiModel || 'gemini-3.8-flash';
    // List candidate models so if pro model or selected model hits quota (429), it immediately falls back to high-quota flash models
    const candidateModels = [
      preferredModel,
      ...(preferredModel !== 'gemini-3.8-flash' ? ['gemini-3.8-flash'] : []),
      'gemini-flash-latest',
    ];

    let lastError: any = null;

    for (const modelToTry of candidateModels) {
      try {
        const response = await callWithRetry(async () => {
          return await ai.models.generateContent({
            model: modelToTry,
            contents: [
              {
                inlineData: {
                  data: cleanBase64,
                  mimeType,
                },
              },
              VISUAL_ANALYSIS_USER_PROMPT,
            ],
            config: {
              systemInstruction: VISUAL_ANALYSIS_SYSTEM_INSTRUCTION,
              responseMimeType: 'application/json',
            },
          });
        }, 1, 1500);

        const text = response.text?.trim() || '{}';
        const parsed = JSON.parse(text);
        return this.sanitizeVisualAnalysis(parsed);
      } catch (err: any) {
        lastError = err;
        const rawMsg = err?.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
        const isQuotaOrServer =
          rawMsg.includes('RESOURCE_EXHAUSTED') ||
          rawMsg.includes('429') ||
          rawMsg.includes('500') ||
          rawMsg.includes('503') ||
          rawMsg.includes('overloaded');

        if (isQuotaOrServer && modelToTry !== candidateModels[candidateModels.length - 1]) {
          console.warn(`Model "${modelToTry}" hit quota limit, auto-retrying with fallback model...`);
          continue;
        }
        break;
      }
    }

    console.error('Gemini visual analysis error:', lastError);
    const rawMsg = lastError?.message || (typeof lastError === 'object' ? JSON.stringify(lastError) : String(lastError));
    if (rawMsg.includes('API_KEY_INVALID') || rawMsg.includes('403') || rawMsg.includes('API key not valid')) {
      throw new Error('Invalid Gemini API Key. Google AI Studio keys usually begin with "AIzaSy...".');
    }
    if (rawMsg.includes('500') || rawMsg.includes('Network error')) {
      throw new Error('Gemini API network error (500). The AI service may be temporarily unavailable or rejecting this key.');
    }
    if (rawMsg.includes('RESOURCE_EXHAUSTED') || rawMsg.includes('429')) {
      throw new Error('Gemini API quota rate limit reached. Please wait a moment before retrying.');
    }
    throw new Error(`Visual analysis error: ${rawMsg}`);
  }

  async analyzeVideo(asset: AssetInput, settings: ExtensionSettings): Promise<VisualAnalysis> {
    const apiKey = this.getEffectiveApiKey(settings);
    if (!apiKey) {
      throw new Error(
        'Gemini API Key is not configured. Please open Settings (⚙️) and enter your Gemini API Key.'
      );
    }

    return analyzeVideoAsset(asset, settings, apiKey);
  }

  async generateMetadata(input: MetadataInput): Promise<StockMetadata> {
    const { analysis, asset, settings } = input;
    const apiKey = this.getEffectiveApiKey(settings);
    if (!apiKey) {
      throw new Error('Gemini API Key is required to generate metadata.');
    }

    const ai = new GoogleGenAI({ apiKey });
    const modelName = settings.geminiModel || 'gemini-3.8-flash';
    const targetKeywords = settings.targetKeywordCount || 30;

    const userPrompt = `
Transform the following factual visual analysis into compliant Adobe Stock metadata.

VISUAL DATA:
- Primary Subjects: ${analysis.primarySubject?.join(', ') || 'N/A'}
- Secondary Subjects: ${analysis.secondarySubjects?.join(', ') || 'N/A'}
- Actions: ${analysis.actions?.join(', ') || 'N/A'}
- Environment: ${analysis.environment?.join(', ') || 'N/A'}
- Supporting Objects: ${analysis.objects?.join(', ') || 'N/A'}
- Visual Style: ${analysis.visualStyle?.join(', ') || 'N/A'}
- Concepts / Themes: ${analysis.concepts?.join(', ') || 'N/A'}
- Composition: ${analysis.composition?.join(', ') || 'N/A'}
- Colors: ${analysis.colors?.join(', ') || 'N/A'}
- Generative AI Indicators: ${analysis.generativeAIIndicators?.join(', ') || 'None'}
- Asset Filename: ${asset.name}
- Target Keyword Count: ${targetKeywords} (between 20 and 35)

REQUIRED JSON OUTPUT FORMAT:
{
  "title": "Concise natural title following: Subject + Action + Context (No clickbait, no promotional adjectives, no 4K/8K)",
  "description": "1 to 2 clear descriptive sentences explaining what, action, and context.",
  "keywords": ["keyword1", "keyword2", "... strictly ranked: #1-10 essential, #11-35 supporting"],
  "category": "Pick exact match from: ${ADOBE_STOCK_CATEGORIES.join(', ')}",
  "aiGeneratedRecommendation": true or false
}
`;

    try {
      const response = await callWithRetry(async () => {
        return await ai.models.generateContent({
          model: modelName,
          contents: [userPrompt],
          config: {
            systemInstruction: METADATA_GENERATION_SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
          },
        });
      }, 2, 1200);

      const text = response.text?.trim() || '{}';
      const parsed = JSON.parse(text);

      return buildMetadataFromAnalysis(
        {
          title: parsed.title,
          description: parsed.description,
          keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
          category: parsed.category,
          aiGeneratedRecommendation: parsed.aiGeneratedRecommendation,
        },
        analysis,
        asset,
        settings
      );
    } catch (err: any) {
      console.warn('AI metadata generation network error, synthesizing directly from structured visual understanding:', err);
      // Resilient fallback: Synthesize compliant metadata directly from the already extracted visual analysis!
      return this.synthesizeMetadataDirectlyFromAnalysis(analysis, asset, settings);
    }
  }

  synthesizeMetadataDirectlyFromAnalysis(
    analysis: VisualAnalysis,
    asset: AssetInput,
    settings: ExtensionSettings
  ): StockMetadata {
    const subject = analysis.primarySubject?.[0] || asset.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    const action = analysis.actions?.[0] || '';
    const env = analysis.environment?.[0] || '';
    const style = analysis.visualStyle?.[0] || '';

    let titleParts: string[] = [];
    if (style && !style.toLowerCase().includes('photo')) {
      titleParts.push(style);
    }
    titleParts.push(subject);
    if (action) {
      titleParts.push(action);
    }
    if (env) {
      titleParts.push(`in ${env}`);
    }
    const title = titleParts.join(' ').trim() || `${subject} stock asset`;

    const descParts: string[] = [];
    descParts.push(`Detailed depiction of ${subject}`);
    if (action) descParts.push(`while ${action}`);
    if (env) descParts.push(`set in ${env}`);
    descParts.push('suitable for commercial advertising and creative editorial publishing.');
    const description = descParts.join(' ');

    const rawKeywords: string[] = [
      ...(analysis.primarySubject || []),
      ...(analysis.secondarySubjects || []),
      ...(analysis.actions || []),
      ...(analysis.environment || []),
      ...(analysis.objects || []),
      ...(analysis.concepts || []),
      ...(analysis.visualStyle || []),
      ...(analysis.colors || []),
      'stock asset',
      'commercial photography',
      'high resolution',
    ];

    return buildMetadataFromAnalysis(
      {
        title,
        description,
        keywords: rawKeywords,
        category: analysis.concepts?.[0] || 'Business',
        aiGeneratedRecommendation: (analysis.generativeAIIndicators && analysis.generativeAIIndicators.length > 0) || true,
      },
      analysis,
      asset,
      settings
    );
  }

  async validateMetadata(input: ValidationInput): Promise<ValidationResult> {
    return calculateQualityScore(input.metadata);
  }

  private sanitizeVisualAnalysis(parsed: any): VisualAnalysis {
    return {
      primarySubject: Array.isArray(parsed.primarySubject) ? parsed.primarySubject : [],
      secondarySubjects: Array.isArray(parsed.secondarySubjects) ? parsed.secondarySubjects : [],
      actions: Array.isArray(parsed.actions) ? parsed.actions : [],
      environment: Array.isArray(parsed.environment) ? parsed.environment : [],
      objects: Array.isArray(parsed.objects) ? parsed.objects : [],
      visualStyle: Array.isArray(parsed.visualStyle) ? parsed.visualStyle : [],
      concepts: Array.isArray(parsed.concepts) ? parsed.concepts : [],
      composition: Array.isArray(parsed.composition) ? parsed.composition : [],
      colors: Array.isArray(parsed.colors) ? parsed.colors : [],
      textDetected: Array.isArray(parsed.textDetected) ? parsed.textDetected : [],
      possibleBrands: Array.isArray(parsed.possibleBrands) ? parsed.possibleBrands : [],
      possibleTrademarks: Array.isArray(parsed.possibleTrademarks) ? parsed.possibleTrademarks : [],
      peoplePresent: !!parsed.peoplePresent,
      fictionalCharacters: !!parsed.fictionalCharacters,
      generativeAIIndicators: Array.isArray(parsed.generativeAIIndicators) ? parsed.generativeAIIndicators : [],
      confidence: parsed.confidence && typeof parsed.confidence === 'object' ? parsed.confidence : {},
    };
  }
}

export const geminiProvider = new GeminiProvider();
