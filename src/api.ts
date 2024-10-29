import { ModelType } from './types';

export const API_URL = 'http://localhost:5000/api';

interface AnalysisResponse {
  prediction: string;
  confidence: number;
  info: any;
  bbox?: number[];
  error?: string;
}

export const analyzeImage = async (
  imageData: string,
  modelType: ModelType
): Promise<AnalysisResponse> => {
  try {
    // Validate image data
    if (!imageData.startsWith('data:image/')) {
      throw new Error('Invalid image format');
    }

    // Add timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageData,
        model_type: modelType,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    
    // Validate response data
    if (!data.prediction || typeof data.confidence !== 'number') {
      throw new Error('Invalid response format from server');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      throw new Error(`Analysis failed: ${error.message}`);
    }
    throw new Error('Analysis failed: Unknown error');
  }
};

// Helper function to check if the server is running
export const checkServerStatus = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${API_URL}/health`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
};