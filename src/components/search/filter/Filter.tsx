import React from 'react';
import FilterLogic from './FilterLogic';
import FilterUI from './FilterUI';

interface FilterProps {
  items: { [key: string]: any[] };
  onFiltered: (filtered: { [key: string]: any[] }) => void;
  total?: number;
  isUsers?: boolean;
}

const Filter: React.FC<FilterProps> = ({ 
  items,
  onFiltered,
  total,
  isUsers
}) => {
  return (
    <FilterLogic items={items} onFiltered={onFiltered} isUsers={isUsers}>
      {({ 
        filters, 
        handleSortChange, 
        handleSearchByChange, 
        handleRootMedicFilterChange,
        handleRecentlyUpdatedChange,
        handleSearchChange 
      }) => (
        <FilterUI
          filters={filters}
          total={total || 0}
          handleSortChange={handleSortChange}
          handleSearchByChange={handleSearchByChange}
          handleRootMedicFilterChange={handleRootMedicFilterChange}
          handleSearchChange={handleSearchChange}
          handleRecentlyUpdatedChange={handleRecentlyUpdatedChange}
          isUsers={isUsers}
        />
      )}
    </FilterLogic>
  );
};

export default Filter;