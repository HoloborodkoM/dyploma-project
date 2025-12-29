import React from 'react';

interface CardProgressBarProps {
  progress: number;
  className?: string;
  barColor?: string;
  bgColor?: string;
}

const CardProgressBar: React.FC<CardProgressBarProps> = ({
  progress,
  className = '',
  barColor = 'bg-blue-500',
  bgColor = 'bg-blue-200'
}) => {
  const normalizedProgress = Math.min(Math.max(progress || 0, 0), 100);

  return (
    <div className={`w-full mt-0.5 ${className}`}>
      <div className={`overflow-hidden h-1 text-xs flex rounded ${bgColor}`}>
        <div 
          style={{ width: `${normalizedProgress}%` }} 
          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${barColor}`}
        ></div>
      </div>
    </div>
  );
};

export default CardProgressBar;