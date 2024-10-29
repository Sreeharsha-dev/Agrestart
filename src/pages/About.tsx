import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Leaf, Bug, Sprout } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-[#F6FB7A]/10 flex flex-col">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 flex-grow">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">About AGRESTART</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-8">
              AGRESTART is an advanced agricultural analysis platform designed to help farmers make informed decisions about their crops using cutting-edge AI technology. Our system provides real-time analysis and recommendations for various agricultural challenges.
            </p>

            <div className="grid gap-8 mb-12">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                  <Leaf className="w-8 h-8 text-[#88D66C] mr-3" />
                  <h2 className="text-2xl font-semibold">Leaf Disease Detection</h2>
                </div>
                <p className="text-gray-600">
                  Our leaf disease detection model can identify various plant diseases with high accuracy. It analyzes leaf images to detect early signs of diseases, helping farmers take preventive measures before the infection spreads. The system provides detailed information about the disease and recommended treatment options.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                  <Bug className="w-8 h-8 text-[#73BBA3] mr-3" />
                  <h2 className="text-2xl font-semibold">Pest Detection</h2>
                </div>
                <p className="text-gray-600">
                  The pest detection system helps identify and count harmful insects and pests in your crops. It provides real-time monitoring capabilities and suggests appropriate pest control measures. This helps in maintaining optimal crop health and preventing pest-related damage.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                  <Sprout className="w-8 h-8 text-[#B4E380] mr-3" />
                  <h2 className="text-2xl font-semibold">Soil Analysis</h2>
                </div>
                <p className="text-gray-600">
                  Our soil analysis model helps determine soil type and quality. It provides recommendations for suitable crops based on soil characteristics and suggests optimal farming practices. This ensures better crop yield and sustainable land use.
                </p>
              </div>
            </div>

            <div className="bg-[#88D66C]/10 p-6 rounded-xl">
              <h2 className="text-2xl font-semibold mb-4">Benefits for Farmers</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Early detection of plant diseases and pests</li>
                <li>Precise recommendations for treatment and prevention</li>
                <li>Real-time monitoring capabilities</li>
                <li>Reduced crop losses and improved yield</li>
                <li>Sustainable farming practices</li>
                <li>Cost-effective crop management</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;