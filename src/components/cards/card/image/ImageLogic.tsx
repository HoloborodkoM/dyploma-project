import React, { useState, useEffect } from 'react';

interface ImageLogicProps {
  imageUrl: string | null | undefined;
  title: string;
  className?: string;
  placeholderColor?: string;
  showPlaceholderIcon?: boolean;
  children: (props: {
    isError: boolean;
    isLoading: boolean;
    handleError: () => void;
    className: string;
    placeholderColor: string;
    showPlaceholderIcon: boolean;
    imageUrl: string | null | undefined;
    title: string;
  }) => React.ReactNode;
}

const ImageLogic: React.FC<ImageLogicProps> = ({
  imageUrl,
  title,
  className = 'w-full h-full object-cover',
  placeholderColor = 'bg-gray-100',
  showPlaceholderIcon = true,
  children
}) => {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!imageUrl) {
      setIsLoading(false);
      return;
    }
    
    setIsError(false);
    setIsLoading(true);
    
    const img = new Image();
    img.src = imageUrl;
    
    img.onload = () => {
      setIsLoading(false);
    };
    
    img.onerror = () => {
      setIsError(true);
      setIsLoading(false);
    };
  }, [imageUrl]);

  const handleError = () => {
    setIsError(true);
  };

  return children({
    isError,
    isLoading,
    handleError,
    className,
    placeholderColor,
    showPlaceholderIcon,
    imageUrl,
    title
  });
};

export default ImageLogic;