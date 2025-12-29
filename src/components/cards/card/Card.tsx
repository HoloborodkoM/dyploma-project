import React, { useState, useEffect } from 'react';
import CardUI from './CardUI';
import CardProgressBar from './CardProgressBar';
import CardFooter from './CardFooter';
import { isRecent } from '../utils/dateUtils';
import { TranslatedText, t } from '../../TranslatedText';

type ButtonType = 'edit' | 'delete' | 'create' | 'add' | null;

interface CardProps {
  item: any;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onClick?: (item: any) => void;
  canEdit?: boolean;
  showProgress?: boolean;
  completed?: boolean;
  hoveredCard?: number | null;
  hoveredButton?: ButtonType;
  onMouseEnter?: (id: number) => void;
  onMouseLeave?: () => void;
  onButtonHover?: (button: ButtonType) => void;
}

const Card: React.FC<CardProps> = ({
  item,
  onEdit,
  onDelete,
  onClick,
  canEdit = false,
  showProgress = false,
  completed = false,
  hoveredCard,
  hoveredButton,
  onMouseEnter,
  onMouseLeave,
  onButtonHover
}) => {
  const [lang, setLang] = useState<'ua' | 'en'>('ua');
  const [editPlaceholder, setEditPlaceholder] = useState('Редагувати');
  const [deletePlaceholder, setDeletePlaceholder] = useState('Видалити');

  useEffect(() => {
    const currentLang = typeof window !== 'undefined' ? localStorage.getItem('preferredLanguage') : 'ua';
    setLang(currentLang === 'en' ? 'en' : 'ua');
  }, []);

  useEffect(() => {
    t('Редагувати', lang).then(setEditPlaceholder);
    t('Видалити', lang).then(setDeletePlaceholder);
  }, [lang]);

  const isRecentlyUpdated = item.editedAt && isRecent(item.editedAt);
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit && onEdit(item);
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete && onDelete(item);
  };
  
  const handleClick = () => {
    onClick && onClick(item);
  };
  
  const renderLeftContent = () => {
    if (completed) {
      return (
        <div className="flex items-center text-green-600 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <TranslatedText text="Завершено" />
        </div>
      );
    }
    return null;
  };
  
  const renderProgressContent = () => {
    if (!showProgress) return null;
    
    return (
      <div className="px-2 pb-0.5">
        <div className="flex justify-between items-center text-xs mb-0.5">
          <span><TranslatedText text="Прогрес:" /> {item.progress || 0}%</span>
          <span>{item.completedLessonsCount}/{item.totalLessons}</span>
        </div>
        <CardProgressBar progress={item.progress || 0} />
      </div>
    );
  };
  
  const actionButtons = canEdit ? [
    {
      id: 'edit' as ButtonType,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-700" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      ),
      tooltip: editPlaceholder,
      onClick: handleEdit,
      hoverColor: 'bg-blue-100',
      onMouseEnter: () => onButtonHover && onButtonHover('edit'),
      onMouseLeave: () => onButtonHover && onButtonHover(null)
    },
    {
      id: 'delete' as ButtonType,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-700" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
      tooltip: deletePlaceholder,
      onClick: handleDelete,
      hoverColor: 'bg-red-100',
      onMouseEnter: () => onButtonHover && onButtonHover('delete'),
      onMouseLeave: () => onButtonHover && onButtonHover(null)
    }
  ] : [];
  
  const footer = (
    <>
      {renderProgressContent()}
      <CardFooter
        leftContent={renderLeftContent()}
        actionButtons={actionButtons}
        hoveredButton={hoveredButton}
        hoveredItem={hoveredCard}
      />
    </>
  );
  
  return (
    <CardUI
      title={item.title}
      description={item.description}
      imageUrl={item.imageUrl}
      isRecent={isRecentlyUpdated}
      version={item.version}
      authorName={item.author?.name}
      footer={footer}
      onClick={handleClick}
      onMouseEnter={() => onMouseEnter && onMouseEnter(item.id)}
      onMouseLeave={onMouseLeave}
    />
  );
};

export default Card;