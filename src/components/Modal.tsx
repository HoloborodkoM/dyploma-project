import React from 'react';

interface ModalProps {
  open?: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function Modal({ open = true, onClose, children, className = '' }: ModalProps) {
  if (!open) return null;
  
  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      <div 
          className={`bg-white rounded-lg shadow-lg py-6 px-2 w-full relative animate-fadeIn overflow-hidden max-w-2xl ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
            className="absolute top-2 right-4 text-gray-400 hover:text-gray-600 text-xl transition-colors"
          onClick={onClose}
        >
          &times;
        </button>
        {children}
      </div>
    </div>
    </>
  );
}