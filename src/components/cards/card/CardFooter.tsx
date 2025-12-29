import React from 'react';

type ButtonType = 'edit' | 'delete' | 'create' | 'add' | null;

export interface ActionButton {
  id: ButtonType;
  icon: React.ReactNode;
  tooltip: string;
  onClick: (e: React.MouseEvent) => void;
  color?: string;
  hoverColor?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

interface CardFooterProps {
  bgColor?: string;
  borderColor?: string;
  leftContent?: React.ReactNode;
  actionButtons?: ActionButton[];
  hoveredButton?: ButtonType;
  hoveredItem?: number | string | null;
  className?: string;
}

const CardFooter: React.FC<CardFooterProps> = ({
  bgColor = 'bg-pink-50',
  borderColor = 'border-pink-100',
  leftContent,
  actionButtons = [],
  hoveredButton,
  hoveredItem,
  className = ''
}) => {
  return (
    <div className={`px-2 py-3 ${bgColor} border-t ${borderColor} flex justify-between items-center ${className}`}>
      {leftContent && (
        <div className="flex items-center text-xs">
          {leftContent}
        </div>
      )}
      
      <div className="flex-grow"></div>
      
      {actionButtons.length > 0 && (
        <div className="flex space-x-1 ml-auto">
          {actionButtons.map((button) => (
            <div className="relative" key={button.id}>
              <button 
                className={`p-1 rounded-full hover:${button.hoverColor || 'bg-gray-100'} transform transition-all`}
                onClick={button.onClick}
                onMouseEnter={button.onMouseEnter}
                onMouseLeave={button.onMouseLeave}
              >
                {button.icon}
              </button>
              {hoveredButton === button.id && hoveredItem !== null && (
                <div className="absolute -top-6 right-0 bg-gray-800 text-white text-xs px-1 py-0.5 rounded whitespace-nowrap z-20">
                  {button.tooltip}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CardFooter;