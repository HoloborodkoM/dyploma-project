import React, { useState, useEffect, useRef } from 'react';
import Card from '../card/Card';

interface CarouselProps {
  items: any[];
  visibleCount?: number;
  loading?: boolean;
  emptyText?: string;
  onCardClick?: (item: any) => void;
}

const Carousel: React.FC<CarouselProps> = ({ 
  items, 
  visibleCount = 4, 
  loading = false, 
  emptyText, 
  onCardClick 
}) => {
  const [start, setStart] = useState(0);
  const [count, setCount] = useState(visibleCount);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const sm = 640;
  const md = 768;
  const lg = 1024;
  const xl = 1280;

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setStart(prev => (prev + 1) % items.length);
    }, 10000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [items.length]);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < sm) setCount(1);
      else if (window.innerWidth < md) setCount(2);
      else if (window.innerWidth < lg) setCount(3);
      else if (window.innerWidth < xl) setCount(4);
      else setCount(visibleCount);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [visibleCount]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[180px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="text-center text-gray-400 py-8">
        {emptyText}
      </div>
    );
  }

  const showItems = [];
  for (let i = 0; i < Math.min(count, items.length); i++) {
    showItems.push(items[(start + i) % items.length]);
  }

  const handlePrev = () => {
    setStart(prev => (prev - 1 + items.length) % items.length);
  };
  const handleNext = () => {
    setStart(prev => (prev + 1) % items.length);
  };

  return (
    <div className="relative w-full flex items-center">
      <button
        className="absolute left-0 z-10 bg-white rounded-full shadow p-2 -translate-y-1/2 top-1/2 disabled:opacity-30"
        onClick={handlePrev}
        disabled={items.length <= count}
        aria-label="Назад"
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
      </button>
      <div className="flex w-full gap-6 justify-center">
        {showItems.map((item) => (
          <div key={item.id} className="flex-1 min-w-0 max-w-xs">
            <Card 
              item={item} 
              onClick={onCardClick} 
            />
          </div>
        ))}
      </div>
      <button
        className="absolute right-0 z-10 bg-white rounded-full shadow p-2 -translate-y-1/2 top-1/2 disabled:opacity-30"
        onClick={handleNext}
        disabled={items.length <= count}
        aria-label="Вперед"
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
      </button>
    </div>
  );
};

export default Carousel;