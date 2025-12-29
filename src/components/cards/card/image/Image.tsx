import React from 'react';
import ImageLogic from './ImageLogic';
import ImageUI from './ImageUI';

interface ImageProps {
  imageUrl: string | null | undefined;
  title: string;
  className?: string;
  placeholderColor?: string;
  showPlaceholderIcon?: boolean;
}

const Image: React.FC<ImageProps> = ({
  imageUrl,
  title,
  className,
  placeholderColor,
  showPlaceholderIcon
}) => {
  return (
    <ImageLogic
      imageUrl={imageUrl}
      title={title}
      className={className}
      placeholderColor={placeholderColor}
      showPlaceholderIcon={showPlaceholderIcon}
    >
      {({
        isError,
        isLoading,
        handleError,
        className,
        placeholderColor,
        showPlaceholderIcon,
        imageUrl,
        title
      }) => (
        <ImageUI
          isError={isError}
          isLoading={isLoading}
          handleError={handleError}
          className={className}
          placeholderColor={placeholderColor}
          showPlaceholderIcon={showPlaceholderIcon}
          imageUrl={imageUrl}
          title={title}
        />
      )}
    </ImageLogic>
  );
};

export default Image;