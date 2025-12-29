import React from 'react';

const NotFoundBlock = ({ message }: { message: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="flex items-center space-x-6 bg-blue-100 px-8 py-6 rounded-lg shadow">
      <div className="flex-shrink-0">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="20" r="12" fill="#90cdf4"/>
          <rect x="16" y="36" width="32" height="20" rx="10" fill="#90cdf4"/>
          <rect x="28" y="44" width="8" height="12" rx="4" fill="#fff"/>
          <rect x="30" y="48" width="4" height="4" rx="2" fill="#3182ce"/>
          <rect x="24" y="50" width="16" height="4" rx="2" fill="#fff"/>
          <rect x="30" y="52" width="4" height="4" rx="2" fill="#3182ce"/>
          <rect x="36" y="48" width="4" height="4" rx="2" fill="#3182ce"/>
        </svg>
      </div>
      <span className="text-2xl font-semibold text-red-600">{message}</span>
    </div>
  </div>
);

export default NotFoundBlock;