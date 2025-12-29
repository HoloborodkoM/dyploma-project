import React, { useState, useEffect } from 'react';
import { TranslatedText, t } from '../../TranslatedText';
import { FilterOptions } from './FilterLogic';

interface FilterUIProps {
  filters: FilterOptions;
  total: number;
  handleSortChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleSearchByChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleRootMedicFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRecentlyUpdatedChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUsers?: boolean;
}

const FilterUI: React.FC<FilterUIProps> = ({
  filters,
  total,
  handleSortChange,
  handleSearchByChange,
  handleRootMedicFilterChange,
  handleSearchChange,
  handleRecentlyUpdatedChange,
  isUsers
}) => {
  const [searchPlaceholder, setSearchPlaceholder] = useState('Пошук');
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
    t('Пошук', lang).then(setSearchPlaceholder);
  }, [lang]);

  if (isUsers) {
    return (
      <div className="filter-container section-spacing">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
          <div className="flex-1 w-full">
            <div className="relative">
              <input
                type="text"
                placeholder={searchPlaceholder}
                className="search-input"
                value={filters.searchTerm}
                onChange={handleSearchChange}
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="filter-container section-spacing">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
        <div className="flex-1 w-full">
          <div className="relative">
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="search-input"
              value={filters.searchTerm}
              onChange={handleSearchChange}
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center">
            <span className="text-sm text-gray-700 mr-3 whitespace-nowrap">
              <TranslatedText text="Сортувати за:" />
            </span>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[50px] max-w-xs w-full"
              value={filters.sortBy}
              onChange={handleSortChange}
            >
              <option value="newest">
                <TranslatedText text="Спочатку нові" />
              </option>
              <option value="oldest">
                <TranslatedText text="Спочатку старі" />
              </option>
              <option value="titleAZ">
                <TranslatedText text="По назві (А-Я)" />
              </option>
              <option value="titleZA">
                <TranslatedText text="По назві (Я-А)" />
              </option>
              <option value="lessonsUp">
                <TranslatedText text="За кількістю уроків ↑" />
              </option>
              <option value="lessonsDown">
                <TranslatedText text="За кількістю уроків ↓" />
              </option>
              <option value="keywordMatch">
                <TranslatedText text="За співпадінням з пошуком" />
              </option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center flex-wrap">
          <span className="text-sm text-gray-700 mr-3">
            <TranslatedText text="Шукати за:" />
          </span>
          <select
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mr-4"
            value={filters.searchBy}
            onChange={handleSearchByChange}
          >
            <option value="all">
              <TranslatedText text="Усі поля" />
            </option>
            <option value="title">
              <TranslatedText text="Назва" />
            </option>
            <option value="keywords">
              <TranslatedText text="Ключові слова" />
            </option>
            <option value="author">
              <TranslatedText text="Автор" />
            </option>
          </select>
          
          <div className="flex items-center mt-2 sm:mt-0 mr-4">
            <input
              type="checkbox"
              id="showOnlyFromRootMedic"
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={filters.showOnlyFromRootMedic}
              onChange={handleRootMedicFilterChange}
            />
            <label htmlFor="showOnlyFromRootMedic" className="text-sm text-gray-700">
              <TranslatedText text="Тільки від Головного медика" />
            </label>
          </div>

          <div className="flex items-center mt-2 sm:mt-0">
            <input
              type="checkbox"
              id="recentlyUpdated"
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={filters.recentlyUpdated}
              onChange={handleRecentlyUpdatedChange}
            />
            <label htmlFor="recentlyUpdated" className="text-sm text-gray-700">
              <TranslatedText text="Нещодавно оновлено" />
            </label>
          </div>
        </div>

        <div className="text-sm text-gray-500 flex mt-2 sm:mt-0">
          <span>
            <TranslatedText text="Знайдено:" /> <span className="font-medium text-gray-700">{total}</span>
          </span>
        </div>
      </div>

      <div className="mt-1 text-xs text-gray-500">
        <TranslatedText text="Часткові співпадіння враховуються" />
      </div>
    </div>
  );
};

export default FilterUI;