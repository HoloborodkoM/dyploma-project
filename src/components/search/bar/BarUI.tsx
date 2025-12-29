import React, { useState, useEffect } from 'react';
import { t } from '../../TranslatedText';

interface BarUIProps {
  searchQuery: string;
  isListening: boolean;
  placeholder?: string;
  withVoice?: boolean;
  setSearchQuery: (query: string) => void;
  handleSearch: () => void;
  toggleListening: () => void;
  handleClearSearch: () => void;
}

const BarUI: React.FC<BarUIProps> = ({
  searchQuery,
  isListening,
  withVoice = true,
  setSearchQuery,
  handleSearch,
  toggleListening,
  handleClearSearch
}) => {
  const [findText, setFindText] = useState('Знайти');
  const [speakNowText, setSpeakNowText] = useState('Говоріть зараз');
  const [placeholderText, setPlaceholderText] = useState('Опишіть ситуацію, наприклад, «кровотеча в області живота»');
  const [lang, setLang] = useState<'ua' | 'en'>('ua');

  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      setLang(event.detail.language);
    };
    
    window.addEventListener('languageChanged' as any, handleLanguageChange);
    
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang === 'en' || savedLang === 'ua') {
      setLang(savedLang as 'ua' | 'en');
    }
    
    return () => {
      window.removeEventListener('languageChanged' as any, handleLanguageChange);
    };
  }, []);

  useEffect(() => {
    t('Знайти', lang).then(setFindText);
    t('Говоріть зараз', lang).then(setSpeakNowText);
    t('Опишіть ситуацію, наприклад, «кровотеча в області живота»', lang).then(setPlaceholderText);
  }, [lang]);

  return (
    <div className="w-full px-8">
      <div className="flex items-center mb-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="w-full px-5 py-4 rounded-l-lg text-gray-700 focus:outline-none"
            placeholder={placeholderText}
          />
          {searchQuery && (
            <button
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              onClick={handleClearSearch}
            >
              ✕
            </button>
          )}
        </div>
        {withVoice && (
          <button
            onClick={toggleListening}
            className={`p-4 ${isListening ? 'bg-red-500' : 'bg-blue-600'} text-white hover:bg-opacity-90`}
          >
            🎤
          </button>
        )}
        <button
          onClick={handleSearch}
          className="px-5 py-4 bg-green-600 text-white font-medium rounded-r-lg hover:bg-green-700"
        >
          {findText}
        </button>
      </div>
      {isListening && (
        <div className="text-center text-blue-600 mt-2">
          {speakNowText}
        </div>
      )}
    </div>
  );
};

export default BarUI;