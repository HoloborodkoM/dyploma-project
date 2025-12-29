import React from 'react';
import Image from './image/Image';
import { TranslatedText } from '../../TranslatedText';
import { capitalizeFirstLetter } from '../utils/textUtils';

export interface CardUIProps {
  title: string;
  description?: string;
  imageUrl?: string | null;
  isRecent?: boolean;
  version?: number;
  authorName?: string;
  className?: string;
  footer?: React.ReactNode;
  topRightBadge?: React.ReactNode;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const CardUI: React.FC<CardUIProps> = ({
  title,
  description,
  imageUrl,
  isRecent,
  version,
  authorName,
  className = '',
  footer,
  topRightBadge,
  onClick,
  onMouseEnter,
  onMouseLeave
}) => {
  return (
    <div 
      className={`relative bg-white rounded-lg shadow-md hover:shadow-lg transition-all transform hover:translate-y-[-4px] overflow-hidden h-[420px] flex flex-col cursor-pointer ${isRecent ? 'border-l-2 border-yellow-400' : ''} ${className}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="h-72 w-full relative overflow-hidden">
        <Image
          imageUrl={imageUrl}
          title={title}
          className="object-cover w-full h-full"
          placeholderColor="bg-gray-50"
          showPlaceholderIcon={true}
        />
        {authorName && (
          <div className="absolute top-2 left-2 bg-white bg-opacity-90 backdrop-blur-sm px-2 py-1 rounded shadow-sm text-xs text-gray-800 z-10">
            <TranslatedText text="Автор:" /> {authorName}
          </div>
        )}
        {isRecent && (
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full z-10 shadow-sm">
            <TranslatedText text="Нещодавно оновлено" />
          </div>
        )}
        {topRightBadge && (
          <div className="absolute top-2 right-2 z-10">
            {topRightBadge}
          </div>
        )}
        {version && version > 1 && (
          <div className="absolute bottom-2 right-2 text-xs">
            <span className="bg-blue-100 bg-opacity-90 backdrop-blur-sm text-blue-700 rounded px-2 py-0.5 shadow-sm">
              v.{version}
            </span>
          </div>
        )}
      </div>
      <div className="px-4 py-3 flex-1 flex flex-col">
        <h3
          className="text-xl font-semibold mb-3 overflow-hidden"
          style={{
            height: '3.1rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          <TranslatedText text={capitalizeFirstLetter(title)} />
        </h3>
        <p className="text-gray-600 text-sm mb-auto overflow-hidden whitespace-nowrap text-ellipsis">
          <TranslatedText text={capitalizeFirstLetter(description || '')} />
        </p>
      </div>
      <div className="mt-auto">{footer && footer}</div>
    </div>
  );
};

export default CardUI;