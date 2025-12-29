import React from 'react';
import { TranslatedText } from '../../TranslatedText';

type ButtonType = 'edit' | 'delete' | 'create' | 'add' | null;

interface CreateCardProps {
  onClick: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  hoveredButton: ButtonType;
}

const CreateCard: React.FC<CreateCardProps> = ({
  onClick,
  onMouseEnter,
  onMouseLeave,
  hoveredButton
}) => {
  return (
    <div 
      className="relative bg-white rounded-lg border-2 border-dashed border-gray-300 h-[420px] flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all transform hover:translate-y-[-4px]"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3 transform hover:scale-110 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <p className="text-blue-700 font-medium">
          <TranslatedText text="Створити" />
        </p>
      </div>
      
      {hoveredButton === 'create' && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 opacity-0 animate-fadeIn">
          <TranslatedText text="Створити" />
        </div>
      )}
    </div>
  );
};

export default CreateCard;