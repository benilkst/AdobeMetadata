import { AssetInput, VisualAnalysis, ExtensionSettings } from '../types';
import { extractRepresentativeFrames } from './frameExtractor';
import { GoogleGenAI } from '@google/genai';
import { VISUAL_ANALYSIS_SYSTEM_INSTRUCTION } from '../ai/prompts/visualAnalysisPrompt';

export const VIDEO_ANALYSIS_SYSTEM_INSTRUCTION = `
${VISUAL_ANALYSIS_SYSTEM_INSTRUCTION}

ADDITIONAL STOCK VIDEO ANALYSIS DIRECTIVES:
1. You are analyzing chronological representative frames from a short stock video footage clip.
2. Observe TEMPORAL EVOLUTION:
   - Identify beginning state vs ending state.
   - Trace dynamic subject movement, pace, and interaction over time.
   - Describe camera movement (e.g. static tripod, smooth drone aerial, panning, tracking shot, slow motion).
3. Do NOT generate keywords based on a single isolated frame that does not represent the overall footage.
4. Return pure JSON matching the VisualAnalysis schema, and include "movementDetails" containing beginningState, endingState, cameraMovement, and pace.
`;

export async function analyzeVideoAsset(
  asset: AssetInput,
  settings: ExtensionSettings,
  apiKey: string
): Promise<VisualAnalysis> {
  const duration = asset.duration || 5;
  const frames = await extractRepresentativeFrames(asset.previewUrl, duration, 5);

  if (frames.length === 0) {
    throw new Error('Unable to extract video frames from asset.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelName = settings.geminiModel || 'gemini-3.8-flash';

  // Build multimodal contents array with all extracted frames and timestamp labels
  const contents: any[] = [];

  frames.forEach((frame, idx) => {
    const cleanBase64 = frame.dataUrl.replace(/^data:[^;]+;base64,/, '');
    contents.push({
      inlineData: {
        data: cleanBase64,
        mimeType: 'image/jpeg',
      },
    });
    contents.push(
      `Frame #${idx + 1} at timestamp ${frame.timestamp}s (${frame.percentage}% of ${Math.round(duration)}s video clip)`
    );
  });

  contents.push(`
Analyze the complete chronological video clip above.
Synthesize the subject, movement, environment, visual style, beginning and ending states into structured JSON matching this schema:
{
  "primarySubject": ["main moving or focal subject"],
  "secondarySubjects": ["supporting elements"],
  "actions": ["actions and movement unfolding across the clip"],
  "environment": ["setting / location"],
  "objects": ["key objects observed"],
  "visualStyle": ["visual aesthetic or footage medium, e.g. cinematic 4k stock footage, 3d animation, realistic drone video"],
  "concepts": ["abstract conceptual themes suitable for stock video buyers"],
  "composition": ["camera framing and perspective"],
  "colors": ["prominent visible colors"],
  "textDetected": ["any visible text"],
  "possibleBrands": ["any potential brands"],
  "possibleTrademarks": ["any potential commercial trademarks"],
  "peoplePresent": false,
  "fictionalCharacters": false,
  "generativeAIIndicators": ["traits indicating synthetic or AI video generation"],
  "confidence": {
    "subject": 0.95,
    "movement": 0.92,
    "environment": 0.90
  },
  "movementDetails": {
    "beginningState": "description of state at start of clip",
    "endingState": "description of state at finish of clip",
    "cameraMovement": "e.g. slow forward tracking shot / static tripod / aerial pan",
    "pace": "e.g. real-time / slow motion / rapid movement"
  }
}
`);

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction: VIDEO_ANALYSIS_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);

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
      videoFrames: frames,
      movementDetails: parsed.movementDetails || undefined,
    };
  } catch (err: any) {
    console.error('Multi-frame temporal video analysis error:', err);
    throw new Error(`Video multi-frame temporal analysis failed: ${err.message || 'Check API configuration'}`);
  }
}
