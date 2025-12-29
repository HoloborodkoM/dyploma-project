import React from 'react';

interface ModalWrapperProps {
  children: React.ReactNode;
  onClose?: () => void;
  hideClose?: boolean;
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({ 
  children, 
  onClose, 
  hideClose 
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-3xl h-full max-h-[70vh] flex flex-col items-stretch bg-white rounded-2xl shadow-xl p-4 relative border border-blue-100">
        {onClose && !hideClose && (
          <button
            className="absolute top-3 right-8 text-gray-400 hover:text-gray-700 text-2xl font-bold"
            onClick={onClose}
            aria-label="Закрити"
          >
            ×
          </button>
        )}
        {children}
      </div>
    </div>
  );
};

export default ModalWrapper;