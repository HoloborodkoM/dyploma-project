import React, { ReactNode } from 'react';

interface CardGridProps {
  children: ReactNode;
}

const CardGrid: React.FC<CardGridProps> = ({
  children,
}) => {
  return (
    <div className={"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"}>
      {children}
    </div>
  );
};

export default CardGrid;