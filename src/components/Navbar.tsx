import React from 'react';
import { Sprout } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Sprout className="w-8 h-8 text-[#88D66C]" />
            <span className="text-2xl font-bold text-gray-800">AGRESTART</span>
          </Link>
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-[#88D66C]">Home</Link>
            <Link to="/about" className="text-gray-600 hover:text-[#88D66C]">About</Link>
            <Link to="/contact" className="text-gray-600 hover:text-[#88D66C]">Contact</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;