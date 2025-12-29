import React from 'react';
import { TranslatedText } from '../../TranslatedText';

type ButtonType = 'edit' | 'delete' | 'create' | 'add' | null;

interface QuickAddButtonProps {
  onClick: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  hoveredButton: ButtonType;
}

const QuickAddButton: React.FC<QuickAddButtonProps> = ({
  onClick,
  onMouseEnter,
  onMouseLeave,
  hoveredButton
}) => {
  return (
    <div className="flex justify-end mb-4">
      <div 
        className="relative w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center cursor-pointer hover:bg-blue-600 transform hover:scale-110 transition-all text-white shadow-md"
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        
        {hoveredButton === 'add' && (
          <div className="absolute -top-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 opacity-0 animate-fadeIn">
            <TranslatedText text="Створити" />
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickAddButton;