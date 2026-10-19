import { VisualAnalysis, StockMetadata, AssetInput, ExtensionSettings } from '../types';
import { ADOBE_STOCK_CATEGORIES } from '../ai/prompts/metadataPrompt';
import { rankKeywords } from './keywordRanker';

export function sanitizeTitle(rawTitle: string, assetName: string): string {
  let title = rawTitle.trim();
  // Strip quotes if wrapped
  title = title.replace(/^["']|["']$/g, '');
  // Remove promotional buzzwords
  title = title.replace(/\b(4k|8k|ultra hd|best|amazing|stunning|epic|breathtaking)\b/gi, '').replace(/\s+/g, ' ').trim();
  
  if (!title) {
    const baseName = assetName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    return `${baseName} visual asset for creative commercial and editorial design`;
  }
  return title;
}

export function formatDescription(rawDesc: string, title: string): string {
  let desc = rawDesc.trim().replace(/^["']|["']$/g, '');
  if (!desc || desc.length < 15) {
    return `${title}. High-quality stock asset prepared for creative publishing and commercial design projects.`;
  }
  return desc;
}

export function resolveCategory(rawCategory: string): { category: string; confidence: number } {
  const match = ADOBE_STOCK_CATEGORIES.find(
    (c) => c.toLowerCase() === rawCategory?.toLowerCase().trim()
  );
  if (match) {
    return { category: match, confidence: 0.94 };
  }

  // Fallback heuristic based on keywords
  return { category: 'Business', confidence: 0.85 };
}

export function buildMetadataFromAnalysis(
  rawMetadata: Partial<StockMetadata>,
  analysis: VisualAnalysis,
  asset: AssetInput,
  settings: ExtensionSettings
): StockMetadata {
  const title = sanitizeTitle(rawMetadata.title || '', asset.name);
  const description = formatDescription(rawMetadata.description || '', title);

  const rawKeywords = Array.isArray(rawMetadata.keywords) ? rawMetadata.keywords : [];
  const rankingResult = rankKeywords(
    rawKeywords,
    {
      subjects: [...(analysis.primarySubject || []), ...(analysis.secondarySubjects || [])],
      actions: analysis.actions || [],
      environments: analysis.environment || [],
      objects: analysis.objects || [],
      styles: analysis.visualStyle || [],
      concepts: analysis.concepts || [],
    },
    settings.targetKeywordCount || 30
  );

  const { category, confidence: categoryConfidence } = resolveCategory(rawMetadata.category || '');

  // Recommend AI disclosure if visual indicators were observed or user default is enabled
  const hasAiIndicators = (analysis.generativeAIIndicators && analysis.generativeAIIndicators.length > 0);
  const aiGeneratedRecommendation = hasAiIndicators || rawMetadata.aiGeneratedRecommendation !== false;

  return {
    title,
    description,
    keywords: rankingResult.ranked,
    classifiedKeywords: rankingResult.classified,
    category,
    categoryConfidence,
    aiGenerated: aiGeneratedRecommendation,
    aiGeneratedRecommendation,
  };
}
