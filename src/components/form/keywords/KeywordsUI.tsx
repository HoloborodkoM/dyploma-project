import React from 'react';
import { TranslatedText } from '@/components/TranslatedText';

interface KeywordsUIProps {
  keywords: string[];
  updateKeyword: (index: number, value: string) => void;
  removeKeyword: (index: number) => void;
  keywordPlaceholder: string;
  wordPlaceholder: string;
  addKeywordText: string;
  newKeyword: string;
  error: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddKeyword: () => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleRemoveKeyword: (index: number) => void;
}

const KeywordsUI: React.FC<KeywordsUIProps> = ({
  keywords,
  keywordPlaceholder,
  addKeywordText,
  wordPlaceholder,
  newKeyword,
  error,
  handleChange,
  handleAddKeyword,
  handleKeyDown,
  handleRemoveKeyword
}) => {
  return (
    <div className="mb-6 w-full max-w-full [@media(max-width:300px)]:p-0.5">
      <label className="block mb-2 text-sm md:text-base font-medium text-gray-700 flex flex-wrap items-center gap-x-1">
        <TranslatedText text="Ключові слова" />
        <span className="text-gray-400 text-xs">(<TranslatedText text="необов'язково" />)</span>
      </label>
      
      <p className="text-xs md:text-sm text-gray-500 mb-2">
        <TranslatedText text="Додайте ключові слова для кращого пошуку курсу. Кожне слово додавайте окремо." />
      </p>
      
      <div className="flex flex-col md:flex-row mb-1 space-y-2 md:space-y-0 md:space-x-2 w-full">
        <div className="flex-grow relative w-full">
          <input
            type="text"
            value={newKeyword}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={`w-full border ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-l-md shadow-sm py-2 px-2 md:px-3 focus:outline-none text-sm md:text-base whitespace-pre-line placeholder:text-gray-400 placeholder:text-xs md:placeholder:text-base`}
            placeholder={window.innerWidth < 320 ? wordPlaceholder : keywordPlaceholder}
            maxLength={20}
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
            {newKeyword.length}/20
          </div>
        </div>
        <button
          type="button"
          onClick={handleAddKeyword}
          className={`w-full md:w-auto ${error || !newKeyword.trim() ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-400 hover:bg-blue-500'} text-white font-medium py-2 px-4 md:px-6 rounded-r-md text-sm md:text-base`}
          disabled={!!error || !newKeyword.trim()}
        >
          <TranslatedText text={addKeywordText} />
        </button>
      </div>
      
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
      
      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {keywords.map((keyword, index) => (
            <div 
              key={index} 
              className="bg-gray-100 text-gray-700 text-xs md:text-sm px-3 py-1 rounded-full group hover:bg-gray-200 transition-colors flex items-center"
            >
              {keyword}
              <button
                type="button"
                onClick={() => handleRemoveKeyword(index)}
                className="ml-1 text-gray-400 hover:text-gray-600 inline-flex items-center justify-center"
                aria-label="Видалити ключове слово"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KeywordsUI;