import { StockMetadata, ValidationResult, QualityWarning } from '../types';
import { checkIpCompliance } from './ipChecker';

export function calculateQualityScore(metadata: StockMetadata): ValidationResult {
  const warnings: QualityWarning[] = checkIpCompliance(metadata);

  // 1. Title Score (max 20 points)
  let titleScore = 20;
  if (!metadata.title || metadata.title.trim().length === 0) {
    titleScore = 0;
  } else {
    const wordCount = metadata.title.trim().split(/\s+/).length;
    if (wordCount < 4) titleScore -= 8; // Too short
    if (wordCount > 25) titleScore -= 5; // Too wordy
    if (/^[A-Z\s]+$/.test(metadata.title)) titleScore -= 10; // All caps
    if (/[!?;]/.test(metadata.title)) titleScore -= 4; // Punctuation spam
  }

  // 2. Description Score (max 15 points)
  let descriptionScore = 15;
  if (!metadata.description || metadata.description.trim().length === 0) {
    descriptionScore = 0;
  } else {
    const descWords = metadata.description.trim().split(/\s+/).length;
    if (descWords < 8) descriptionScore -= 5;
  }

  // 3. Keywords Score (max 25 points)
  let keywordsScore = 25;
  const kwCount = metadata.keywords.length;
  if (kwCount < 10) keywordsScore -= 15;
  else if (kwCount < 20) keywordsScore -= 5;
  else if (kwCount > 49) keywordsScore -= 12;

  // 4. IP Safety Score (max 25 points)
  let ipSafetyScore = 25;
  const redWarnings = warnings.filter((w) => w.level === 'red');
  const yellowWarnings = warnings.filter((w) => w.level === 'yellow');
  ipSafetyScore -= redWarnings.length * 12;
  ipSafetyScore -= yellowWarnings.length * 3;
  if (ipSafetyScore < 0) ipSafetyScore = 0;

  // 5. Relevance Score (max 10 points)
  let relevanceScore = 10;
  if (!metadata.category) relevanceScore -= 5;

  // 6. AI Compliance Score (max 5 points)
  let aiComplianceScore = 5;

  const overall = Math.max(
    10,
    Math.min(
      100,
      titleScore + descriptionScore + keywordsScore + ipSafetyScore + relevanceScore + aiComplianceScore
    )
  );

  return {
    overallScore: Math.round(overall),
    titleScore: Math.round((titleScore / 20) * 100),
    descriptionScore: Math.round((descriptionScore / 15) * 100),
    keywordsScore: Math.round((keywordsScore / 25) * 100),
    relevanceScore: Math.round((relevanceScore / 10) * 100),
    ipSafetyScore: Math.round((ipSafetyScore / 25) * 100),
    aiComplianceScore: 100,
    warnings,
  };
}
