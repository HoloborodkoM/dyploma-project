import { Simulation } from '@/components/form/types';
import React, { useState, useRef, useEffect } from 'react';

export interface BarLogicProps {
  withVoice?: boolean;
  simulations?: Simulation[];
  onFilteredResults?: (filteredSimulations: Simulation[]) => void;
  children: (props: {
    searchQuery: string;
    isListening: boolean;
    setSearchQuery: (query: string) => void;
    handleSearch: () => void;
    toggleListening: () => void;
    handleClearSearch: () => void;
  }) => React.ReactNode;
}

const BarLogic: React.FC<BarLogicProps> = ({ 
  withVoice = true,
  simulations = [],
  onFilteredResults,
  children
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (withVoice && typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.lang = 'uk-UA';
        recognitionRef.current.interimResults = false;
        recognitionRef.current.maxAlternatives = 1;

        recognitionRef.current.onresult = (event: any) => {
          const speechResult = event.results[0][0].transcript;
          setSearchQuery(speechResult);
          handleSearchAndFilter(speechResult);
          setIsListening(false);
        };

        recognitionRef.current.onerror = () => {
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, [withVoice, simulations, onFilteredResults]);

  const filterSimulations = (query: string, simulationsToFilter: Simulation[]): Simulation[] => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    const words = lowerQuery.split(/\s+/);

    const scored = simulationsToFilter.map(simulation => {
      let score = 0;
      const title = simulation.title.toLowerCase();
      const description = simulation.description.toLowerCase();
      const keywords = (simulation.keywords || []).map(kw => kw.toLowerCase());
      
      for (const word of words) {
        if (title.includes(word)) score += 3;
        if (description.includes(word)) score += 2;
        if (keywords.some(kw => kw.includes(word))) score += 4;
      }
      return { simulation, score };
    });
    const filtered = scored.filter(s => s.score > 0);
    filtered.sort((a, b) => b.score - a.score);
    return filtered.map(s => s.simulation);
  };

  const handleSearchAndFilter = (query: string) => {
    if (simulations.length > 0 && onFilteredResults) {
      const filtered = filterSimulations(query, simulations);
      onFilteredResults(filtered);
    }
  };

  const handleSearch = () => {
    handleSearchAndFilter(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    handleSearchAndFilter('');
  };

  const toggleListening = () => {
    if (!withVoice) return;
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        setSearchQuery('');
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (error) {
        setIsListening(false);
      }
    }
  };

  return children({
    searchQuery,
    isListening,
    setSearchQuery,
    handleSearch,
    toggleListening,
    handleClearSearch
  });
};

export default BarLogic;