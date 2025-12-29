import React, { useRef, useState } from 'react';
import { TranslatedText } from '@/components/TranslatedText';

interface StepUIProps {
  videoPreviewUrl: string;
  onVideoChange: (file: File) => void;
  onTitleChange: (v: string) => void;
  onContentChange: (v: string) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  title: string;
  content: string;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onRemoveVideo?: () => void;
  titleError?: string;
  contentError?: string;
  videoError?: string;
  fileLoading?: boolean;
  step?: { videoUrl?: string };
  titlePlaceholder: string;
  contentPlaceholder: string;
  moveUpTitle: string;
  moveDownTitle: string;
  removeTitle: string;
}

const StepUI: React.FC<StepUIProps> = ({
  videoPreviewUrl,
  onVideoChange,
  onTitleChange,
  onContentChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  title,
  content,
  canMoveUp = true,
  canMoveDown = true,
  onRemoveVideo,
  titleError,
  contentError,
  videoError,
  fileLoading = false,
  step,
  titlePlaceholder,
  contentPlaceholder,
  moveUpTitle,
  moveDownTitle,
  removeTitle
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  React.useEffect(() => {
    const dropArea = dropRef.current;
    if (!dropArea) return;
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      dropArea.classList.add('border-blue-500', 'bg-blue-50');
    };
    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dropArea.classList.remove('border-blue-500', 'bg-blue-50');
    };
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dropArea.classList.remove('border-blue-500', 'bg-blue-50');
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        onVideoChange(file);
      }
    };
    dropArea.addEventListener('dragover', handleDragOver);
    dropArea.addEventListener('dragleave', handleDragLeave);
    dropArea.addEventListener('drop', handleDrop);
    return () => {
      dropArea.removeEventListener('dragover', handleDragOver);
      dropArea.removeEventListener('dragleave', handleDragLeave);
      dropArea.removeEventListener('drop', handleDrop);
    };
  }, [onVideoChange]);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };
  const handleConfirmDelete = () => {
    onRemoveVideo && onRemoveVideo();
    setShowDeleteModal(false);
  };
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  return (
    <>
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="mb-4 text-lg font-semibold text-gray-800"><TranslatedText text="Ви впевнені, що хочете прибрати це відео?" /></div>
            <div className="flex justify-end gap-2">
              <button onClick={handleCancelDelete} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"><TranslatedText text="Назад" /></button>
              <button onClick={handleConfirmDelete} className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white"><TranslatedText text="Так" /></button>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-white rounded-lg shadow border border-gray-200">
        <div className="flex-1 flex flex-col items-center justify-center max-w-[320px] relative min-h-[130px] w-full mx-auto">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={e => {
              if (e.target.files?.[0]) {
                onVideoChange(e.target.files[0]);
              }
            }}
          />
          {fileLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
              <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
          {step?.videoUrl || videoPreviewUrl ? (
            <div className="relative w-full h-32 flex items-center justify-center" onClick={() => { fileInputRef.current?.click(); }} style={{ cursor: 'pointer' }}>
              <img
                src={videoPreviewUrl}
                alt="preview"
                className="w-full h-full object-cover rounded-lg border"
                style={{ maxHeight: 128, minHeight: 128 }}
              />
              <button
                type="button"
                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md hover:bg-red-100 transition-colors"
                onClick={e => { e.stopPropagation(); handleDeleteClick(e); }}
                title="Видалити відео"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ) : (
            <div
              ref={dropRef}
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors cursor-pointer select-none"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10V6a5 5 0 0110 0v4M12 16v-4m0 0l-2 2m2-2l2 2" />
              </svg>
              <span className="text-xs text-gray-500 text-center [@media(max-width:180px)]:hidden"><TranslatedText text="Завантажити відео" /></span>
              <span className="text-xs text-gray-500 ml-1">&lt;50MB</span>
            </div>
          )}
          {!fileLoading && videoError && (
            <div className="mt-2 flex items-center text-red-500 bg-red-50 p-2 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium"><TranslatedText text="Файл не завантажено" /></span>
            </div>
          )}
          {!fileLoading && step?.videoUrl && !videoError && (
            <div className="mt-2 flex items-center text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs"><TranslatedText text="Файл завантажено" /></span>
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <input
            type="text"
            value={title}
            onChange={e => onTitleChange(e.target.value)}
            placeholder={titlePlaceholder}
            className="w-full p-2 border rounded text-sm font-semibold border-gray-300"
            maxLength={100}
          />
          {titleError && <div className="text-red-500 text-xs mt-1">{titleError}</div>}
          <textarea
            value={content}
            onChange={e => onContentChange(e.target.value)}
            placeholder={contentPlaceholder}
            className="w-full p-2 border rounded text-sm border-gray-300 min-h-[60px] overflow-y-auto overscroll-contain"
            maxLength={1000}
          />
          {contentError && <div className="text-red-500 text-xs mt-1">{contentError}</div>}
          <div className="flex gap-2 mt-2 items-center">
            <button
              type="button"
              className={`px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 ${!canMoveUp ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={canMoveUp ? onMoveUp : undefined}
              disabled={!canMoveUp}
              title={moveUpTitle}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              type="button"
              className={`px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 ${!canMoveDown ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={canMoveDown ? onMoveDown : undefined}
              disabled={!canMoveDown}
              title={moveDownTitle}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              type="button"
              className="ml-auto px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 flex items-center group"
              onClick={onRemove}
              title={removeTitle}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path strokeLinecap="round" fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default StepUI;