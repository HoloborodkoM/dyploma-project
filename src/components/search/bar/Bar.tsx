import React from 'react';
import BarLogic from './BarLogic';
import { Simulation } from '@/components/form/types';
import BarUI from './BarUI';

interface BarProps {
  placeholder?: string;
  withVoice?: boolean;
  simulations?: Simulation[];
  onFilteredResults?: (filteredSimulations: Simulation[]) => void;
}

export default function Bar({ 
  placeholder = '', 
  withVoice = true,
  simulations = [],
  onFilteredResults
}: BarProps) {
  return (
    <BarLogic
      withVoice={withVoice}
      simulations={simulations}
      onFilteredResults={onFilteredResults}
    >
      {({
        searchQuery,
        isListening,
        setSearchQuery,
        handleSearch,
        toggleListening,
        handleClearSearch
      }) => (
        <BarUI
          searchQuery={searchQuery}
          isListening={isListening}
          placeholder={placeholder}
          withVoice={withVoice}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
          toggleListening={toggleListening}
          handleClearSearch={handleClearSearch}
        />
      )}
    </BarLogic>
  );
}