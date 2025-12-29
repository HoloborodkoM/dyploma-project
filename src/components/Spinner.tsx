import React from 'react';

const Spinner: React.FC = () => (
  <div className="flex items-center justify-center w-full h-full py-10">
    <svg width="60" height="60" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-spin">
      <circle cx="40" cy="40" r="36" stroke="#E53935" strokeWidth="8" fill="#fff" />
      <rect x="34" y="20" width="12" height="40" rx="3" fill="#E53935" />
      <rect x="20" y="34" width="40" height="12" rx="3" fill="#E53935" />
    </svg>
  </div>
);

export default Spinner;