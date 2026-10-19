export type MediaType = 'image' | 'video';

export interface AssetInput {
  file: File;
  name: string;
  type: string;
  size: number;
  previewUrl: string;
  mediaType: MediaType;
  width?: number;
  height?: number;
  duration?: number; // seconds for video
  aspectRatio?: string;
  base64?: string;
}

export interface ExtractedFrame {
  timestamp: number;
  percentage: number;
  dataUrl: string;
}

export interface VideoMovementDetails {
  beginningState?: string;
  endingState?: string;
  cameraMovement?: string;
  pace?: string;
}

export interface VisualAnalysis {
  primarySubject: string[];
  secondarySubjects: string[];
  actions: string[];
  environment: string[];
  objects: string[];
  visualStyle: string[];
  concepts: string[];
  composition: string[];
  colors: string[];
  textDetected: string[];
  possibleBrands: string[];
  possibleTrademarks: string[];
  peoplePresent: boolean;
  fictionalCharacters: boolean;
  generativeAIIndicators: string[];
  confidence: Record<string, number>;
  videoFrames?: ExtractedFrame[];
  movementDetails?: VideoMovementDetails;
}

export interface StockMetadata {
  title: string;
  description: string;
  keywords: string[];
  category: string;
  categoryConfidence?: number;
  aiGenerated: boolean;
  aiGeneratedRecommendation: boolean;
  classifiedKeywords?: Array<{ keyword: string; group: string; priorityScore: number }>;
}

export type WarningLevel = 'green' | 'yellow' | 'red';

export interface QualityWarning {
  level: WarningLevel;
  code: string;
  message: string;
  keyword?: string;
  recommendation?: string;
}

export interface ValidationResult {
  overallScore: number;
  titleScore: number;
  descriptionScore: number;
  keywordsScore: number;
  relevanceScore: number;
  ipSafetyScore: number;
  aiComplianceScore: number;
  warnings: QualityWarning[];
}

export type AIProviderId = 'gemini' | 'openai' | 'claude';

export interface ExtensionSettings {
  aiProvider: AIProviderId;
  geminiApiKey: string;
  geminiModel: string;
  targetKeywordCount: number;
  language: string;
  strictIpMode: boolean;
  aiDisclosureDefault: boolean;
  descriptionLength?: 'concise' | 'detailed';
  uiScale?: number;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  filename: string;
  fileType: string;
  fileSize: number;
  mediaType: MediaType;
  previewThumbnail?: string;
  metadata?: StockMetadata;
  analysis?: VisualAnalysis;
  validation?: ValidationResult;
}

export type ProcessingStage = 
  | 'idle' 
  | 'queued' 
  | 'analyzing' 
  | 'generating' 
  | 'validating' 
  | 'completed' 
  | 'error';
