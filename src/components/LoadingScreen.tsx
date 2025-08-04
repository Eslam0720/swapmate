import React from 'react';

interface LoadingScreenProps {
  children?: React.ReactNode;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6">
        {/* Logo */}
        <div className="mx-auto">
          <img 
            src="https://d64gsuwffb70l.cloudfront.net/68794542f32439e209e49d32_1753489451678_9a9bec0d.png" 
            alt="SwapMate Logo" 
            className="h-16 w-auto object-contain mx-auto"
          />
        </div>
        
        {/* Slogan */}
        <div className="space-y-2">
          <p className="text-lg text-gray-600 font-medium">
            Swap Your Things In a Tap
          </p>
        </div>
        
        {/* Loading spinner */}
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        
        {children}
      </div>
    </div>
  );
};

export default LoadingScreen;