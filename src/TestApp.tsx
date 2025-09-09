import React from 'react';

const TestApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-blue-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          🔮 Tarot Timer Test Page
        </h1>
        <p className="text-gray-600 mb-4">
          If you can see this page with blue background and white card, Tailwind CSS is working!
        </p>
        <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors">
          Test Button
        </button>
      </div>
    </div>
  );
};

export default TestApp;