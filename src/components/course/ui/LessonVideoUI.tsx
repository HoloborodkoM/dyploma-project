import React from 'react';
import { TranslatedText } from '@/components/TranslatedText';

interface LessonVideoUIProps {
  title: string;
  content?: string;
  videoUrl: string;
  onExit: () => void;
  onComplete: () => void;
  completed: boolean;
}

const LessonVideoUI: React.FC<LessonVideoUIProps> = ({ 
  title, 
  content, 
  videoUrl, 
  onExit, 
  onComplete, 
  completed 
}) => {
  return (
    <div className="flex flex-col h-full overflow-auto overscroll-contain">
      <h2 className="text-2xl font-bold mb-2 text-blue-900 break-words">
        <TranslatedText text={title} />
      </h2>
      {content && (
        <div className="mb-3 text-gray-700 text-sm border rounded p-2 bg-gray-50 max-h-[60px] overflow-auto overscroll-contain">
          <TranslatedText text={content} />
        </div>
      )}
      <div className="flex-1 min-h-0 flex items-start justify-start mb-2 overflow-auto overscroll-contain">
        <video controls className="rounded-lg w-full h-full min-w-[250px] min-h-[350px] object-contain bg-black">
          <source src={videoUrl} />
          <TranslatedText text="Ваш браузер не підтримує відео!" />
        </video>
      </div>
      <div className="flex flex-col w-full gap-2 mt-2 [@media(min-width:370px)]:flex-row [@media(min-width:370px)]:justify-end [@media(min-width:370px)]:items-center [@media(min-width:370px)]:w-auto [@media(min-width:370px)]:gap-2">
        <button className="w-full [@media(min-width:370px)]:w-auto px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition" onClick={onExit}>
          <TranslatedText text="Вийти" />
        </button>
        {!completed && <button className="w-full [@media(min-width:370px)]:w-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition" onClick={onComplete}>
          <TranslatedText text="Завершити урок" />
        </button>}
      </div>
    </div>
  );
};

export default LessonVideoUI;