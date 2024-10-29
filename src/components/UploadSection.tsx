import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Upload, Camera, AlertCircle } from 'lucide-react';
import { ModelType, UploadType } from '../types';
import { analyzeImage, checkServerStatus } from '../api';
import Loader from './Loader';

interface UploadSectionProps {
  modelType: ModelType;
  uploadType: UploadType;
  onFileSelect: (file: File) => void;
  setResult: (result: any) => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({
  modelType,
  uploadType,
  onFileSelect,
  setResult,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLiveDetectionActive, setIsLiveDetectionActive] = useState(false);
  const [isServerAvailable, setIsServerAvailable] = useState<boolean>(true);

  useEffect(() => {
    const checkServer = async () => {
      const status = await checkServerStatus();
      setIsServerAvailable(status);
    };
    checkServer();
  }, []);

  const handleError = (error: Error) => {
    setError(error.message);
    setIsAnalyzing(false);
  };

  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = URL.createObjectURL(file);
    });
  };

  const analyzeFile = async (file: File) => {
    try {
      if (!isServerAvailable) {
        throw new Error('Server is not available. Please try again later.');
      }

      setIsAnalyzing(true);
      setError(null);

      // Validate image
      const isValid = await validateImage(file);
      if (!isValid) {
        throw new Error('Invalid image file');
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Data = reader.result as string;
          const result = await analyzeImage(base64Data, modelType);
          setResult(result);
        } catch (error) {
          if (error instanceof Error) {
            handleError(error);
          }
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.onerror = () => {
        handleError(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      if (error instanceof Error) {
        handleError(error);
      }
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (uploadType === 'image' && !isImage) {
      setError('Please select an image file (JPG, PNG, or WEBP)');
      return;
    }

    if (uploadType === 'video' && !isVideo) {
      setError('Please select a video file (MP4 or WEBM)');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size should be less than 10MB');
      return;
    }

    onFileSelect(file);
    await analyzeFile(file);
  };

  const startStream = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (error) {
      setError('Error accessing camera: Please ensure camera permissions are granted');
    }
  };

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsLiveDetectionActive(false);
      setError(null);
    }
  };

  const captureAndAnalyzeFrame = useCallback(async () => {
    if (!videoRef.current || !isLiveDetectionActive || !isServerAvailable) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      try {
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        const result = await analyzeImage(imageData, modelType);
        setResult(result);
        setError(null);
      } catch (error) {
        if (error instanceof Error) {
          handleError(error);
        }
      }
    }
  }, [isLiveDetectionActive, modelType, setResult, isServerAvailable]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isLiveDetectionActive) {
      intervalId = setInterval(captureAndAnalyzeFrame, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isLiveDetectionActive, captureAndAnalyzeFrame]);

  if (!isServerAvailable) {
    return (
      <div className="bg-red-50 p-6 rounded-xl shadow-lg">
        <div className="flex items-center space-x-3 text-red-600">
          <AlertCircle className="w-6 h-6" />
          <h3 className="text-lg font-semibold">Server Unavailable</h3>
        </div>
        <p className="mt-2 text-red-600">
          The analysis server is currently unavailable. Please ensure the Flask server is running and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-semibold mb-4">Upload {uploadType}</h3>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isAnalyzing && <Loader />}
      
      {uploadType === 'stream' ? (
        <div className="space-y-4">
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex justify-center space-x-4">
            {!stream ? (
              <button
                onClick={startStream}
                className="flex items-center space-x-2 px-4 py-2 bg-[#88D66C] text-white rounded-lg hover:bg-[#73BBA3] transition-colors"
              >
                <Camera className="w-5 h-5" />
                <span>Start Camera</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsLiveDetectionActive(!isLiveDetectionActive)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isLiveDetectionActive
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-[#88D66C] hover:bg-[#73BBA3] text-white'
                  }`}
                >
                  {isLiveDetectionActive ? 'Stop Detection' : 'Start Detection'}
                </button>
                <button
                  onClick={stopStream}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Stop Camera
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? 'border-[#88D66C] bg-[#88D66C]/10' : 'border-gray-300'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            handleFileSelect(file);
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept={uploadType === 'image' ? 'image/*' : 'video/*'}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
          />
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">
            Drag and drop your {uploadType} here, or{' '}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-[#88D66C] hover:text-[#73BBA3]"
            >
              browse
            </button>
          </p>
          <p className="text-sm text-gray-500">
            {uploadType === 'image' 
              ? 'Supported formats: JPG, PNG, WEBP (max 10MB)' 
              : 'Supported formats: MP4, WEBM (max 10MB)'}
          </p>
        </div>
      )}
    </div>
  );
};

export default UploadSection;