import React, { useState } from 'react';
import CardGrid from './CardGrid';
import Card from '../card/Card';
import CreateCard from './CreateCard';
import QuickAddButton from './QuickAddButton';
import { TranslatedText } from '../../TranslatedText';

type ButtonType = 'edit' | 'delete' | 'create' | 'add' | null;

interface CardListProps {
  items: any[];
  user: any;
  showProgress?: boolean;
  completed?: boolean;
  isMine?: boolean;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onStart?: (item: any) => void;
}

const CardList: React.FC<CardListProps> = ({ 
  items, 
  user, 
  showProgress, 
  completed, 
  isMine, 
  onEdit, 
  onDelete, 
  onStart,
}) => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [hoveredButton, setHoveredButton] = useState<ButtonType>(null);
  
  const handleCreateClick = () => {
    if (user?.role === 'MEDIC' || user?.role === 'ROOT') {
      onStart && onStart({ id: 'create' });
    }
  };
  
  const isMineAndCanCreate = isMine && (user?.role === 'MEDIC' || user?.role === 'ROOT');

  if ((!items || items.length === 0) && isMineAndCanCreate) {
    return (
      <div className="px-2">
        <CardGrid>
          <CreateCard
            onClick={handleCreateClick}
            onMouseEnter={() => setHoveredButton('create')}
            onMouseLeave={() => setHoveredButton(null)}
            hoveredButton={hoveredButton}
          />
        </CardGrid>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="min-h-[200px] flex items-center justify-center text-gray-500">
        <TranslatedText text="Нічого не знайдено" />
      </div>
    );
  }

  const canEditItem = (item: any) => {
    if (!user) return false;
    if (user.role === 'ROOT') return true;
    return isMine && user.id === item.authorId;
  };

  const handleCardClick = (item: any) => {
    onStart && onStart(item);
  };

  const handleQuickAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user?.role === 'MEDIC' || user?.role === 'ROOT') {
      onStart && onStart({ id: 'create' });
    }
  };
  
  const handleButtonHover = (button: ButtonType) => {
    setHoveredButton(button);
  };
  
  return (
    <div className="px-2">
      {isMineAndCanCreate && items.length > 0 && (
        <QuickAddButton
          onClick={handleQuickAddClick}
          onMouseEnter={() => setHoveredButton('add')}
          onMouseLeave={() => setHoveredButton(null)}
          hoveredButton={hoveredButton}
        />
      )}
      
      <CardGrid>
        {items.map(item => (
          <Card
            key={item.id}
            item={item}
            onEdit={onEdit}
            onDelete={onDelete}
            onClick={handleCardClick}
            canEdit={canEditItem(item)}
            showProgress={showProgress}
            completed={completed}
            hoveredCard={hoveredCard}
            hoveredButton={hoveredCard === item.id ? hoveredButton : null}
            onMouseEnter={setHoveredCard}
            onMouseLeave={() => setHoveredCard(null)}
            onButtonHover={handleButtonHover}
          />
        ))}
        
        {isMineAndCanCreate && (
          <CreateCard
            onClick={handleCreateClick}
            onMouseEnter={() => setHoveredButton('create')}
            onMouseLeave={() => setHoveredButton(null)}
            hoveredButton={hoveredButton}
          />
        )}
      </CardGrid>
    </div>
  );
};

export default CardList;