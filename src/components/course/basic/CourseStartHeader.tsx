import React from 'react';
import { TranslatedText } from '@/components/TranslatedText';

interface CourseStartHeaderProps {
  started: boolean;
  progress: number;
  onStart: () => void;
  title: string;
  completedCount?: number;
  totalCount?: number;
  description?: string;
}

const CourseStartHeader: React.FC<CourseStartHeaderProps> = ({ 
  started, 
  progress, 
  onStart, 
  title, 
  completedCount, 
  totalCount, 
  description 
}) => {
  return (
    <div className="flex flex-col py-4 border-b mb-6">
      <div className="flex flex-col md:flex-row items-center justify-between w-full">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 md:mb-0">
          <TranslatedText text={title} />
        </h1>
        {!started ? (
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition mb-2 md:mb-0"
            onClick={onStart}
          >
            <TranslatedText text="Почати проходження курсу" />
          </button>
        ) : (
          <div className="w-full md:w-80 mb-2 md:mb-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-blue-700">
                <TranslatedText text="Прогрес курсу" />
              </span>
              <span className="text-sm font-medium text-blue-700">{progress}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            {typeof completedCount === 'number' && typeof totalCount === 'number' && (
              <div className="text-xs text-gray-500 mt-1 text-right">{completedCount}/{totalCount}</div>
            )}
          </div>
        )}
      </div>
      {description && (
        <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 text-base leading-relaxed w-full">
          <TranslatedText text={description} />
        </div>
      )}
    </div>
  );
};

export default CourseStartHeader;