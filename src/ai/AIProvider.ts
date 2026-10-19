import { AssetInput, VisualAnalysis, StockMetadata, ValidationResult, ExtensionSettings } from '../types';

export interface MetadataInput {
  analysis: VisualAnalysis;
  asset: AssetInput;
  settings: ExtensionSettings;
}

export interface ValidationInput {
  metadata: StockMetadata;
  analysis: VisualAnalysis;
  asset: AssetInput;
  strictIpMode: boolean;
}

export interface AIProvider {
  readonly id: string;
  readonly name: string;
  isConfigured(settings: ExtensionSettings): boolean;
  analyzeImage(input: AssetInput, settings: ExtensionSettings): Promise<VisualAnalysis>;
  analyzeVideo(input: AssetInput, settings: ExtensionSettings): Promise<VisualAnalysis>;
  generateMetadata(input: MetadataInput): Promise<StockMetadata>;
  validateMetadata(input: ValidationInput): Promise<ValidationResult>;
}
