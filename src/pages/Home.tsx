import React, { useState } from 'react';
import { Upload, Camera, Leaf, Bug, Sprout, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import UploadSection from '../components/UploadSection';
import ResultSection from '../components/ResultSection';
import Footer from '../components/Footer';
import { ModelType, UploadType } from '../types';

function Home() {
  const [selectedModel, setSelectedModel] = useState<ModelType | null>(null);
  const [uploadType, setUploadType] = useState<UploadType | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);

  const resetState = () => {
    setSelectedModel(null);
    setUploadType(null);
    setSelectedFile(null);
    setResult(null);
  };

  const handleBack = () => {
    if (uploadType) {
      setUploadType(null);
      setSelectedFile(null);
      setResult(null);
    } else if (selectedModel) {
      setSelectedModel(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6FB7A]/10 flex flex-col">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        {(selectedModel || uploadType) && (
          <div className="mb-8">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-600 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Go Back</span>
            </button>
          </div>
        )}

        {!selectedModel ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <button
              onClick={() => setSelectedModel('leaf')}
              className="flex flex-col items-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <Leaf className="w-16 h-16 text-[#88D66C]" />
              <h3 className="mt-4 text-xl font-semibold text-gray-800">Leaf Analysis</h3>
              <p className="mt-2 text-gray-600 text-center">Detect leaf diseases and get treatment recommendations</p>
            </button>

            <button
              onClick={() => setSelectedModel('pest')}
              className="flex flex-col items-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <Bug className="w-16 h-16 text-[#73BBA3]" />
              <h3 className="mt-4 text-xl font-semibold text-gray-800">Pest Detection</h3>
              <p className="mt-2 text-gray-600 text-center">Identify and count pests affecting your crops</p>
            </button>

            <button
              onClick={() => setSelectedModel('soil')}
              className="flex flex-col items-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <Sprout className="w-16 h-16 text-[#B4E380]" />
              <h3 className="mt-4 text-xl font-semibold text-gray-800">Soil Analysis</h3>
              <p className="mt-2 text-gray-600 text-center">Analyze soil type and get crop recommendations</p>
            </button>
          </div>
        ) : !uploadType ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <button
              onClick={() => setUploadType('image')}
              className="flex flex-col items-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <Upload className="w-16 h-16 text-[#88D66C]" />
              <h3 className="mt-4 text-xl font-semibold text-gray-800">Upload Image</h3>
              <p className="mt-2 text-gray-600 text-center">Upload an image for analysis</p>
            </button>

            <button
              onClick={() => setUploadType('video')}
              className="flex flex-col items-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <Upload className="w-16 h-16 text-[#73BBA3]" />
              <h3 className="mt-4 text-xl font-semibold text-gray-800">Upload Video</h3>
              <p className="mt-2 text-gray-600 text-center">Upload a video for analysis</p>
            </button>

            <button
              onClick={() => setUploadType('stream')}
              className="flex flex-col items-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <Camera className="w-16 h-16 text-[#B4E380]" />
              <h3 className="mt-4 text-xl font-semibold text-gray-800">Live Stream</h3>
              <p className="mt-2 text-gray-600 text-center">Use your camera for real-time analysis</p>
            </button>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedModel.charAt(0).toUpperCase() + selectedModel.slice(1)} Analysis
              </h2>
              <button
                onClick={resetState}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Start Over
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <UploadSection
                modelType={selectedModel}
                uploadType={uploadType}
                onFileSelect={setSelectedFile}
                setResult={setResult}
              />
              <ResultSection
                modelType={selectedModel}
                result={result}
                selectedFile={selectedFile}
              />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Home;