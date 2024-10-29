import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white shadow-md mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <p className="text-gray-600">
            © {new Date().getFullYear()} AGRESTART. All rights reserved.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Developed by{' '}
            <span className="font-semibold text-[#88D66C]">
              Sreeharsha Muttamatam
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;