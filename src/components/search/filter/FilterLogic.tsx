import React, { useState, useEffect } from 'react';

export interface FilterOptions {
  sortBy: 'newest' | 'oldest' | 'titleAZ' | 'titleZA' | 'lessonsUp' | 'lessonsDown' | 'keywordMatch';
  showOnlyFromRootMedic: boolean;
  recentlyUpdated: boolean;
  searchTerm: string;
  searchBy: 'all' | 'title' | 'keywords' | 'author';
}

interface FilterLogicProps {
  items: { [key: string]: any[] };
  onFiltered: (filtered: { [key: string]: any[] }) => void;
  isUsers?: boolean;
  children: (props: {
    filters: FilterOptions;
    handleSortChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    handleSearchByChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    handleRootMedicFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleRecentlyUpdatedChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isUsers?: boolean;
  }) => React.ReactNode;
}

function filterUsers(users: any[], searchTerm: string) {
  if (!searchTerm) return users;
  const searchLower = searchTerm.toLowerCase();
  return users.filter(user =>
    (user.email && user.email.toLowerCase().includes(searchLower)) ||
    (user.name && user.name.toLowerCase().includes(searchLower))
  );
}

function filterEntities(entities: any[], filters: FilterOptions) {
  let result = [...entities];
  const { searchTerm, searchBy, showOnlyFromRootMedic, sortBy, recentlyUpdated } = filters;

  if (showOnlyFromRootMedic) {
    result = result.filter(entity => {
      const isRootAuthor = entity.author && entity.author.role === 'ROOT';
      return isRootAuthor;
    });
  }

  if (recentlyUpdated) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    result = result.filter(entity => {
      if (!entity.editedAt) return false;
      return new Date(entity.editedAt) > weekAgo;
    });
  }

  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    result = result.filter(entity => {
      let relevance = 0;
      if (searchBy === 'all' || searchBy === 'title') {
        if (entity.title.toLowerCase().includes(searchLower)) relevance += 3;
      }
      if (searchBy === 'all' && entity.description && entity.description.toLowerCase().includes(searchLower)) relevance += 1;
      if ((searchBy === 'all' || searchBy === 'keywords') && entity.keywords && Array.isArray(entity.keywords)) {
        entity.keywords.forEach((keyword: string) => {
          if (keyword.toLowerCase().includes(searchLower) || searchLower.includes(keyword.toLowerCase())) relevance += 2;
        });
      }
      if ((searchBy === 'all' || searchBy === 'author') && entity.author) {
        if (entity.author.name.toLowerCase().includes(searchLower)) relevance += 2;
      }
      entity.searchRelevance = relevance;
      return relevance > 0;
    });
  }

  switch (sortBy) {
    case 'newest':
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case 'oldest':
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      break;
    case 'titleAZ':
      result.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'titleZA':
      result.sort((a, b) => b.title.localeCompare(a.title));
      break;
    case 'lessonsUp':
      result.sort((a, b) => (b.totalLessons || 0) - (a.totalLessons || 0));
      break;
    case 'lessonsDown':
      result.sort((a, b) => (a.totalLessons || 0) - (b.totalLessons || 0));
      break;
    case 'keywordMatch':
      if (searchTerm) {
        result.sort((a, b) => (b.searchRelevance || 0) - (a.searchRelevance || 0));
      }
      break;
  }

  return result;
}

const FilterLogic: React.FC<FilterLogicProps> = ({ items, onFiltered, isUsers, children }) => {
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: 'newest',
    showOnlyFromRootMedic: false,
    recentlyUpdated: false,
    searchTerm: '',
    searchBy: 'all',
  });

  useEffect(() => {
    const filtered: { [key: string]: any[] } = {};
    if (isUsers) {
      Object.keys(items).forEach(key => {
        filtered[key] = filterUsers(items[key], filters.searchTerm);
      });
    } else {
      Object.keys(items).forEach(key => {
        filtered[key] = filterEntities(items[key], filters);
      });
    }
    onFiltered(filtered);
  }, [filters, items, onFiltered, isUsers]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({
      ...prev,
      sortBy: e.target.value as FilterOptions['sortBy'],
    }));
  };

  const handleSearchByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({
      ...prev,
      searchBy: e.target.value as FilterOptions['searchBy'],
    }));
  };

  const handleRootMedicFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      showOnlyFromRootMedic: e.target.checked,
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      searchTerm: e.target.value,
    }));
  };

  const handleRecentlyUpdatedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      recentlyUpdated: e.target.checked,
    }));
  };

  return children({
    filters,
    handleSortChange,
    handleSearchByChange,
    handleRootMedicFilterChange,
    handleSearchChange,
    handleRecentlyUpdatedChange,
    isUsers
  });
};

export default FilterLogic;