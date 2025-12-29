import React from 'react';
import { TranslatedText } from '@/components/TranslatedText';

interface LessonTextUIProps {
  title: string;
  content: string;
  onExit: () => void;
  onComplete: () => void;
  completed: boolean;
}

const LessonTextUI: React.FC<LessonTextUIProps> = ({ 
  title, 
  content, 
  onExit, 
  onComplete, 
  completed 
}) => {
  const handleDownload = () => {
    const blob = new Blob([`${title}\n\n${content}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-zA-Z0-9а-яА-ЯёЁіІїЇєЄ\s_-]/g, '') || 'lesson'}.txt`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <div className="flex flex-col h-full overflow-auto overscroll-contain">
      <h2 className="text-2xl font-bold mb-2 text-blue-900 break-words">
        <TranslatedText text={title} />
      </h2>
      <div className="flex-1 text-lg text-gray-800 whitespace-pre-line border rounded p-4 bg-gray-50 mb-1 overflow-auto overscroll-contain">
        <TranslatedText text={content} />
      </div>
      <div className="flex flex-col w-full gap-2 mt-2 [@media(min-width:370px)]:flex-row [@media(min-width:370px)]:justify-end [@media(min-width:370px)]:items-center [@media(min-width:370px)]:w-auto [@media(min-width:370px)]:gap-2">
        <button className="w-full [@media(min-width:370px)]:w-auto px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition" onClick={onExit}>
          <TranslatedText text="Вийти" />
        </button>
        <button className="w-full [@media(min-width:370px)]:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition" onClick={handleDownload}>
          <TranslatedText text="Скачати текст" />
        </button>
        {!completed && <button className="w-full [@media(min-width:370px)]:w-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition" onClick={onComplete}>
          <TranslatedText text="Завершити урок" />
        </button>}
      </div>
    </div>
  );
};

export default LessonTextUI;