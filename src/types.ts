export type ModelType = 'leaf' | 'pest' | 'soil';
export type UploadType = 'image' | 'video' | 'stream';

export interface AnalysisResult {
  prediction: string;
  confidence: number;
  recommendations: string[];
}