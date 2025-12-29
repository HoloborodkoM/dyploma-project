import React, { useState, useEffect } from 'react';
import { t } from '@/components/TranslatedText';

interface KeywordsLogicProps {
  keywords: string[];
  updateKeywords: (keywords: string[]) => void;
  removeKeyword: (index: number) => void;
  children: (props: {
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
  }) => React.ReactNode;
}

const KeywordsLogic: React.FC<KeywordsLogicProps> = ({
  keywords,
  updateKeywords,
  removeKeyword,
  children
}) => {
  const [keywordPlaceholder, setKeywordPlaceholder] = useState("Додайте ключове слово");
  const [wordPlaceholder, setWordPlaceholder] = useState("Ключове слово");
  const [addKeywordText, setAddKeywordText] = useState("Додати");
  const [lang, setLang] = useState<'ua' | 'en'>('ua');
  const [newKeyword, setNewKeyword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const currentLang = typeof window !== 'undefined' ? localStorage.getItem('preferredLanguage') : 'ua';
    setLang(currentLang === 'en' ? 'en' : 'ua');
  }, []);

  useEffect(() => {
    t("Додайте ключове слово", lang).then(setKeywordPlaceholder);
    t("Додати", lang).then(setAddKeywordText);
    t("Ключове слово", lang).then(setWordPlaceholder);
  }, [lang]);
  
  useEffect(() => {
    setError('');
  }, [keywords]);

  const isValidKeyword = (keyword: string): boolean => {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) return false;
    if (normalized.includes(' ')) return false;
    if (keywords.some(k => k.trim().toLowerCase() === normalized)) return false;
    return true;
  };
  
  const updateKeyword = (index: number, value: string) => {
    const trimmedValue = value.trim().toLowerCase();
    if (index >= keywords.length) {
      if (isValidKeyword(trimmedValue)) {
        const newKeywords = [...keywords, trimmedValue];
        updateKeywords(newKeywords);
      }
    } else {
      const newKeywords = [...keywords];
      const isDuplicate = keywords.some((k, i) =>
        i !== index && k.trim().toLowerCase() === trimmedValue
      );
      if (!trimmedValue.includes(' ') && !isDuplicate) {
        newKeywords[index] = trimmedValue;
        updateKeywords(newKeywords);
      }
    }
  };
  
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewKeyword(value);
    if (value.includes(' ')) {
      const errorText = await t('Введіть лише одне слово без пробілів', lang);
      setError(errorText);
    } else {
      setError('');
    }
  };
  
  const handleAddKeyword = async () => {
    const normalized = newKeyword.trim().toLowerCase();
    if (!normalized) return;
    if (normalized.includes(' ')) {
      const errorText = await t('Введіть лише одне слово без пробілів', lang);
      setError(errorText);
      return;
    }
    if (keywords.some(k => k.trim().toLowerCase() === normalized)) {
      const errorText = await t('Таке ключове слово вже додано', lang);
      setError(errorText);
      return;
    }
    updateKeyword(keywords.length, normalized);
    setNewKeyword('');
    setError('');
  };
  
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };
  
  const handleRemoveKeyword = (index: number) => {
    removeKeyword(index);
    setError('');
  };

  return children({
    keywords,
    updateKeyword,
    removeKeyword,
    keywordPlaceholder,
    wordPlaceholder,
    addKeywordText,
    newKeyword,
    error,
    handleChange,
    handleAddKeyword,
    handleKeyDown,
    handleRemoveKeyword
  });
};

export default KeywordsLogic;