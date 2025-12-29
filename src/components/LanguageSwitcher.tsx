'use client'

import { useState, useEffect } from 'react';

function getInitialLang(): 'ua' | 'en' {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('preferredLanguage');
    if (saved === 'en' || saved === 'ua') return saved;
  }
  return 'ua';
}

export function LanguageSwitcher() {
  const [language, setLanguage] = useState<'ua' | 'en'>('ua');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = getInitialLang();
    setLanguage(saved);
    
  }, []);

  const setLang = (lang: 'ua' | 'en') => {
    setLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
    const event = new CustomEvent('languageChanged', { detail: { language: lang } });
    window.dispatchEvent(event);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setLang('ua')}
        className={`px-2 py-1 rounded font-medium ${language === 'ua' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
      >
        UA
      </button>
      <span className="text-gray-400">|</span>
      <button
        onClick={() => setLang('en')}
        className={`px-2 py-1 rounded font-medium ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
      >
        EN
      </button>
    </div>
  );
}