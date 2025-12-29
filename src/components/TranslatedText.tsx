'use client';

import { useState, useEffect } from 'react';

interface TranslatedTextProps {
  text: string;
  className?: string;
}

function getInitialLang(): 'ua' | 'en' {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('preferredLanguage');
    if (saved === 'en' || saved === 'ua') return saved;
  }
  return 'ua';
}

export function TranslatedText({ text, className }: TranslatedTextProps) {
  const [translatedText, setTranslatedText] = useState(text);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'ua' | 'en'>(getInitialLang);
  const [showSpinner, setShowSpinner] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  const translateText = async (text: string, targetLang: string) => {
    if (targetLang === 'ua') return text;
    const lang = targetLang === 'en' ? 'en' : 'en';

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, target: lang })
      });
      const data = await response.json();
      return data.translatedText || text;
    } catch (e) {
      return text;
    }
  };

  useEffect(() => {
    setMounted(true);
    setTimeout(() => setVisible(true), 50);
  }, []);

  useEffect(() => {
    let fadeTimeout: NodeJS.Timeout;
    let spinnerTimeout: NodeJS.Timeout;
    let showTextTimeout: NodeJS.Timeout;

    const doTranslation = async () => {
      setVisible(false);
      spinnerTimeout = setTimeout(() => setShowSpinner(true), 200);
      fadeTimeout = setTimeout(async () => {
        setIsLoading(true);
        const result = await translateText(text, currentLanguage);
        setTranslatedText(result);
        setIsLoading(false);
        setShowSpinner(false);
        showTextTimeout = setTimeout(() => setVisible(true), 100);
      }, 300);
    };

    if (mounted) {
      doTranslation();
    }

    return () => {
      clearTimeout(fadeTimeout);
      clearTimeout(spinnerTimeout);
      clearTimeout(showTextTimeout);
    };
  }, [text, currentLanguage, mounted]);

  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      setCurrentLanguage(event.detail.language);
    };
    window.addEventListener('languageChanged' as any, handleLanguageChange);
    return () => {
      window.removeEventListener('languageChanged' as any, handleLanguageChange);
    };
  }, []);

  if (!mounted) return null;

  return (
    <span
      className={className}
      style={{
        opacity: visible && !isLoading ? 1 : 0,
        transition: 'opacity 0.3s'
      }}
    >
      {showSpinner && isLoading ? <span className="spinner" /> : translatedText}
    </span>
  );
}

export async function t(text: string, lang: 'ua' | 'en') {
  if (lang === 'ua') return text;
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, target: lang })
    });
    const data = await response.json();
    return data.translatedText || text;
  } catch (e) {
    return text;
  }
}