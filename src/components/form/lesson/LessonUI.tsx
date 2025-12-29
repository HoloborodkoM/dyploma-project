import React, { useState, useEffect } from 'react';
import { Lesson } from '../types';
import { TranslatedText } from '@/components/TranslatedText';
import Test from '../test/Test';
import { Test as TestType } from '../test/types';

interface LessonUIProps {
  lesson: Lesson;
  removeLesson: () => void;
  moveUp?: () => void;
  moveDown?: () => void;
  isLoading?: boolean;
  lessonTitlePlaceholder: string;
  textContentPlaceholder: string;
  typeText: string;
  typeVideo: string;
  typeDocument: string;
  typeTest: string;
  moveUpTitle: string;
  moveDownTitle: string;
  removeLessonTitle: string;
  lessonTitleError?: string;
  lessonContentError?: string;
  deleteFileText: string;
  uploadVideoText: string;
  maxVideoSizeText: string;
  videoDescText: string;
  uploadDocText: string;
  supportedDocTypesText: string;
  maxDocSizeText: string;
  docDescText: string;
  optionalText: string;
  handleTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleVideoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDocumentUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDeleteFile: () => void;
  handleTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  formatFileName: (fileName: string) => string;
  clearLessonContentError?: (sectionIdx: number, lessonIdx: number) => void;
  lessonIdx?: number;
  sectionIdx?: number;
  handleTestChange?: (test: TestType) => void;
}

const LessonUI: React.FC<LessonUIProps & {
  testDraft?: TestType;
  setTestDraft?: React.Dispatch<React.SetStateAction<TestType>>;
  isTestEditing?: boolean;
  editPlaceholder: string;
  deletePlaceholder: string;
  setIsTestEditing?: React.Dispatch<React.SetStateAction<boolean>>;
  testSaved?: boolean;
  handleEditTest?: () => void;
  handleDeleteTest?: () => void;
  handleSaveTest?: (test: TestType) => void;
  validateAndSaveTest?: (test: TestType) => boolean;
  showTestError?: boolean;
  setShowTestError?: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({
  lesson,
  removeLesson,
  moveUp,
  moveDown,
  isLoading,
  lessonTitlePlaceholder,
  textContentPlaceholder,
  typeText,
  typeVideo,
  typeDocument,
  typeTest,
  moveUpTitle,
  moveDownTitle,
  removeLessonTitle,
  lessonTitleError,
  lessonContentError,
  deleteFileText,
  uploadVideoText,
  maxVideoSizeText,
  videoDescText,
  uploadDocText,
  supportedDocTypesText,
  maxDocSizeText,
  docDescText,
  optionalText,
  handleTitleChange,
  handleContentChange,
  handleVideoUpload,
  handleDocumentUpload,
  handleDeleteFile,
  handleTypeChange,
  handleDescriptionChange,
  formatFileName,
  clearLessonContentError,
  lessonIdx,
  sectionIdx,
  testDraft,
  setTestDraft,
  isTestEditing,
  editPlaceholder,
  deletePlaceholder,
  setIsTestEditing,
  testSaved,
  handleEditTest,
  handleDeleteTest,
  handleSaveTest,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (lesson.type !== 'TEST') {
      setIsTestEditing?.(false);
    }
  }, [lesson.type]);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    handleDeleteFile();
    if (typeof sectionIdx === 'number' && typeof lessonIdx === 'number' && clearLessonContentError) {
      clearLessonContentError(sectionIdx, lessonIdx);
    }
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
            <div className="mb-4 text-lg font-semibold text-gray-800"><TranslatedText text="Ви впевнені, що хочете прибрати цей файл?" /></div>
            <div className="flex justify-end gap-2">
              <button onClick={handleCancelDelete} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"><TranslatedText text="Назад" /></button>
              <button onClick={handleConfirmDelete} className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white"><TranslatedText text="Так" /></button>
            </div>
          </div>
        </div>
      )}
      <div className="p-2 md:p-3 border border-gray-200 rounded-lg shadow-sm mb-3 bg-white w-full max-w-full [@media(max-width:300px)]:p-0.5">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2 space-y-2 md:space-y-0 md:space-x-2">
          <div className="flex-1">
            <input
              type="text"
              value={lesson.title}
              onChange={handleTitleChange}
              className={`w-full border ${lessonTitleError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-2 md:px-3 text-sm md:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
              placeholder={lessonTitlePlaceholder}
              maxLength={100}
            />
            <div className="flex justify-between">
              {lessonTitleError && (
                <div className="text-xs text-red-500 mt-1">{lessonTitleError}</div>
              )}
              <div className="text-xs text-gray-500 mt-1 ml-auto">{lesson.title.length}/100</div>
            </div>
          </div>
          <div className="flex items-center md:ml-3">
            {moveUp && (
              <button
                type="button"
                onClick={moveUp}
                className="text-gray-400 hover:text-gray-600 mx-1 p-1 hover:bg-gray-100 rounded"
                title={moveUpTitle}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            {moveDown && (
              <button
                type="button"
                onClick={moveDown}
                className="text-gray-400 hover:text-gray-600 mx-1 p-1 hover:bg-gray-100 rounded"
                title={moveDownTitle}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            <button
              type="button"
              onClick={removeLesson}
              className="text-red-500 hover:text-red-700 ml-2 p-1 hover:bg-red-50 rounded"
              title={removeLessonTitle}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mb-3">
          <select
            value={lesson.type}
            onChange={handleTypeChange}
            className="block w-full mt-1 text-sm border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="TEXT">{typeText}</option>
            <option value="VIDEO">{typeVideo}</option>
            <option value="DOCUMENT">{typeDocument}</option>
            <option value="TEST">{typeTest}</option>
          </select>
        </div>

        {lesson.type === 'TEXT' && (
          <div className="relative">
            <textarea
              value={lesson.content || ''}
              onChange={handleContentChange}
              className={`w-full mt-1 text-sm border ${lesson.type === 'TEXT' && lessonContentError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 overflow-y-auto overscroll-contain`}
              rows={4}
              placeholder={textContentPlaceholder}
              maxLength={5000}
            />
            <div className="flex justify-between">
              {lesson.type === 'TEXT' && lessonContentError && (
                <div className="text-xs text-red-500 mt-1">{lessonContentError}</div>
              )}
              <div className="text-xs text-gray-500 mt-1 ml-auto">
                {(lesson.content?.length || 0)}/5000
              </div>
            </div>
          </div>
        )}

        {lesson.type === 'VIDEO' && (
          <div className="mt-2 p-3 border border-gray-100 rounded-lg bg-gray-50">
            <div className="flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
              <span className="text-sm font-medium"><TranslatedText text="Відео файл" /></span>
            </div>
            
            {lesson.tempFileName && !isLoading ? (
              <div className="border border-gray-300 rounded-md p-3 bg-white relative flex items-center">
                <span className="text-sm text-gray-700 truncate min-w-0 pr-8" title={lesson.tempFileName || ''}>{formatFileName(lesson.tempFileName || '')}</span>
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700 bg-white z-10 p-1 rounded-full"
                  title={deleteFileText}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ) : isLoading && lesson.tempFileName ? (
              <div className="border border-gray-300 rounded-md p-3 bg-white flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm text-gray-700 truncate overflow-hidden whitespace-nowrap max-w-[120px]" title={lesson.tempFileName || ''}>{formatFileName(lesson.tempFileName || '')}</span>
                </div>
                <span className="animate-spin h-5 w-5 mr-2 border-2 border-blue-400 border-t-transparent rounded-full"></span>
              </div>
            ) : (
              <div className={`border border-dashed ${lessonContentError ? 'border-red-500' : 'border-gray-300'} rounded-md p-6 flex flex-col items-center justify-center bg-white relative h-full text-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
                <p className="text-sm text-center text-gray-700 mb-1 [@media(max-width:275px)]:hidden">
                  {uploadVideoText}
                </p>
                <p className="text-xs text-center text-gray-500 mb-3 [@media(max-width:275px)]:hidden">
                  {maxVideoSizeText}
                </p>
                <span className="inline [@media(min-width:276px)]:hidden text-xs text-gray-500 mb-3 flex items-center justify-center">
                  <span className="ml-1">&lt;200MB</span>
                </span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                />
              </div>
            )}
            {isLoading && (
              <div className="mt-2 flex items-center text-blue-500">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
            {!isLoading && lesson.videoUrl && (
              <div className="mt-2 flex items-center text-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs"><TranslatedText text="Файл успішно завантажено" /></span>
              </div>
            )}
            {lesson.type === 'VIDEO' && lessonContentError && !lesson.videoUrl && !lesson.tempFileName && !isLoading && (
              <div className="mt-2 text-xs text-red-500 p-2 bg-red-50 rounded-md flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{lessonContentError}</span>
              </div>
            )}
            {lesson.uploadError && (
              <div className="mt-2 flex items-center text-red-500 bg-red-50 p-2 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-medium">{lesson.uploadError}</span>
              </div>
            )}
            
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex flex-wrap items-center gap-x-1">
                <TranslatedText text="Опис" />
                <span className="text-gray-400 text-xs">(<TranslatedText text={optionalText} />)</span>
              </label>
              <textarea
                value={lesson.content || ''}
                onChange={handleDescriptionChange}
                className={`w-full text-sm border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 overflow-y-auto overscroll-contain`}
                rows={3}
                placeholder={videoDescText}
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {(lesson.content?.length || 0)}/500
              </div>
            </div>
          </div>
        )}

        {lesson.type === 'DOCUMENT' && (
          <div className="mt-2 p-3 border border-gray-100 rounded-md bg-gray-50">
            <div className="flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium"><TranslatedText text="Документ" /></span>
            </div>
            
            {lesson.tempFileName && !isLoading ? (
              <div className="border border-gray-300 rounded-md p-3 bg-white relative flex items-center">
                <span className="text-sm text-gray-700 truncate min-w-0 pr-8" title={lesson.tempFileName || ''}>{formatFileName(lesson.tempFileName || '')}</span>
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700 bg-white z-10 p-1 rounded-full"
                  title={deleteFileText}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ) : lesson.tempFileName && isLoading ? (
              <div className="border border-gray-300 rounded-md p-3 bg-white flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm text-gray-700 truncate overflow-hidden whitespace-nowrap max-w-[120px]" title={lesson.tempFileName || ''}>{formatFileName(lesson.tempFileName || '')}</span>
                </div>
                <span className="animate-spin h-5 w-5 mr-2 border-2 border-blue-400 border-t-transparent rounded-full"></span>
              </div>
            ) : (
              <div className={`border border-dashed ${lessonContentError ? 'border-red-500' : 'border-gray-300'} rounded-md p-6 flex flex-col items-center justify-center bg-white relative`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm text-center text-gray-700 mb-1 [@media(max-width:280px)]:hidden">
                  {uploadDocText}
                </p>
                <p className="text-xs text-center text-gray-500 mb-3 [@media(max-width:280px)]:hidden">
                  {supportedDocTypesText}
                </p>
                <p className="text-xs text-center text-gray-500 mb-3 [@media(max-width:280px)]:hidden">
                  {maxDocSizeText}
                </p>
                <span className="inline [@media(min-width:281px)]:hidden text-xs text-gray-500 mb-3 flex items-center justify-center">
                  <span className="ml-1">&lt;50MB</span>
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,image/*,.txt"
                  onChange={handleDocumentUpload}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                />
              </div>
            )}
            {isLoading && (
              <div className="mt-2 flex items-center text-blue-500">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
            {!isLoading && lesson.documentUrl && (
              <div className="mt-2 flex items-center text-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs"><TranslatedText text="Файл успішно завантажено" /></span>
              </div>
            )}
            {lesson.type === 'DOCUMENT' && lessonContentError && !lesson.documentUrl && !lesson.tempFileName && !isLoading && (
              <div className="mt-2 text-xs text-red-500 p-2 bg-red-50 rounded-md flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{lessonContentError}</span>
              </div>
            )}
            {lesson.uploadError && (
              <div className="mt-2 flex items-center text-red-500 bg-red-50 p-2 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-medium">{lesson.uploadError}</span>
              </div>
            )}
            
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex flex-wrap items-center gap-x-1">
                <TranslatedText text="Опис" />
                <span className="text-gray-400 text-xs">(<TranslatedText text={optionalText} />)</span>
              </label>
              <textarea
                value={lesson.content || ''}
                onChange={handleDescriptionChange}
                className={`w-full text-sm border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 overflow-y-auto overscroll-contain`}
                rows={3}
                placeholder={docDescText}
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {(lesson.content?.length || 0)}/500
              </div>
            </div>
          </div>
        )}

        {lesson.type === 'TEST' && (
          <>
            {testSaved && !isTestEditing ? (
              <div className="relative flex items-center bg-blue-50 border border-blue-200 rounded p-2">
                <svg className="h-6 w-6 text-blue-500 mr-2 mb-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-3-3v6m9 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium text-blue-700 truncate min-w-0 pr-14"><TranslatedText text="Тест збережено" /></span>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 z-10">
                  <button type="button" onClick={handleEditTest} title={editPlaceholder} className="p-1 text-gray-500 hover:text-blue-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 [@media(max-width:300px)]:h-4 [@media(max-width:300px)]:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3h3z" />
                    </svg>
                  </button>
                  <button type="button" onClick={handleDeleteTest} title={deletePlaceholder} className="p-1 text-red-500 hover:text-red-700 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 [@media(max-width:300px)]:h-4 [@media(max-width:300px)]:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : null}
            {isTestEditing && testDraft && setTestDraft && handleSaveTest && (
              <div className="bg-white border border-blue-100 rounded p-3 mt-2">
                <Test
                  initialTest={testDraft}
                  onChange={setTestDraft}
                  errors={{}}
                  onSaveTest={() => handleSaveTest(testDraft)}
                />
              </div>
            )}
            {lesson.type === 'TEST' && !testSaved && (
              <div className="mt-2 text-xs text-red-500 p-2 bg-red-50 rounded-md flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-medium"><TranslatedText text="Тест не збережено" /></span>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default LessonUI;