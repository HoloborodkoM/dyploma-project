import React from 'react';

interface ImageUIProps {
  isError: boolean;
  isLoading: boolean;
  handleError: () => void;
  className: string;
  placeholderColor: string;
  showPlaceholderIcon: boolean;
  imageUrl: string | null | undefined;
  title: string;
}

const MedicalCrossPlaceholder = ({ className, placeholderColor }: { className: string, placeholderColor: string }) => (
  <div className={`${placeholderColor} flex items-center justify-center ${className} transition-transform duration-500 hover:scale-110`}>
    <div className="text-red-600 w-full h-full flex items-center justify-center">
      <svg 
        viewBox="0 0 100 100" 
        className="w-[60%]"
        preserveAspectRatio="xMidYMid meet"
      >
        <circle cx="50" cy="50" r="45" fill="rgba(255, 255, 255, 0.7)" stroke="#E53E3E" strokeWidth="4" />
        <rect x="45" y="20" width="10" height="60" fill="#E53E3E" />
        <rect x="20" y="45" width="60" height="10" fill="#E53E3E" />
      </svg>
    </div>
  </div>
);

const ImageUI: React.FC<ImageUIProps> = ({
  isError,
  isLoading,
  handleError,
  className = 'w-full h-full object-cover',
  placeholderColor = 'bg-gray-50',
  showPlaceholderIcon = true,
  imageUrl,
  title
}) => {
  if (!imageUrl || isError) {
    return showPlaceholderIcon ? (
      <MedicalCrossPlaceholder className={className} placeholderColor={placeholderColor} />
    ) : (
      <div className={`${placeholderColor} ${className}`}></div>
    );
  }

  if (isLoading) {
    return (
      <div className={`${placeholderColor} ${className} animate-pulse flex items-center justify-center`}>
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="relative w-full h-full overflow-hidden">
      <img
        src={imageUrl}
        alt={title}
        className={`${className} transition-opacity duration-300`}
        onError={handleError}
      />
    </div>
  );
};

export default ImageUI;