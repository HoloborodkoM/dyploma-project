import React from 'react';
import { Section } from '../types';
import { TranslatedText } from '@/components/TranslatedText';
import Lesson from '../lesson/Lesson';

interface SectionUIProps {
  section: Section;
  addLesson: () => void;
  removeLesson: (lessonIdx: number) => void;
  updateLesson: (lessonIdx: number, field: string, value: any) => void;
  handleFileUpload: (lessonIdx: number, file: File) => void;
  removeSection: () => void;
  moveUp?: () => void;
  moveDown?: () => void;
  moveLessonUp: (lessonIdx: number) => void;
  moveLessonDown: (lessonIdx: number) => void;
  fileLoading: { [key: string]: boolean };
  sectionTitlePlaceholder: string;
  addLessonText: string;
  moveUpTitle: string;
  moveDownTitle: string;
  removeSectionTitle: string;
  emptyLessonsText: string;
  handleSectionTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors?: Record<string, string>;
  sectionError?: string;
  sectionIdx?: number;
  clearLessonContentError?: (sectionIdx: number, lessonIdx: number) => void;
  setNotification?: React.Dispatch<React.SetStateAction<{ type: 'success' | 'error', message: string } | null>>;
}

const SectionUI: React.FC<SectionUIProps> = ({
  section,
  addLesson,
  removeLesson,
  updateLesson,
  handleFileUpload,
  removeSection,
  moveUp,
  moveDown,
  moveLessonUp,
  moveLessonDown,
  fileLoading,
  sectionTitlePlaceholder,
  addLessonText,
  moveUpTitle,
  moveDownTitle,
  removeSectionTitle,
  emptyLessonsText,
  handleSectionTitleChange,
  errors,
  sectionError,
  sectionIdx,
  clearLessonContentError,
  setNotification,
}) => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 md:p-4 mb-4 [@media(max-width:300px)]:p-0.5">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 space-y-2 md:space-y-0 md:space-x-2">
        <div className="flex-1">
          <input
            type="text"
            value={section.title}
            onChange={handleSectionTitleChange}
            className={`w-full border ${sectionError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-2 md:px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm md:text-base font-medium`}
            placeholder={sectionTitlePlaceholder}
            maxLength={100}
          />
          <div className="flex justify-between">
            {sectionError && (
              <div className="text-xs text-red-500 mt-1">{sectionError}</div>
            )}
            <div className="text-xs text-gray-500 mt-1 ml-auto">{section.title.length}/100</div>
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
            onClick={removeSection}
            className="text-red-500 hover:text-red-700 ml-2 p-1 hover:bg-red-50 rounded"
            title={removeSectionTitle}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <div className="ml-4 space-y-3">
        {section.lessons.length === 0 && (
          <div className={`p-3 ${errors?.course ? 'bg-red-50 border-red-100 text-red-500' : 'bg-gray-50 border-gray-100 text-gray-500'} border rounded-md text-sm`}>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${errors?.course ? 'text-red-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><TranslatedText text={errors?.course || emptyLessonsText} /></span>
            </div>
          </div>
        )}
        
        {section.lessons.map((lesson, lessonIdx) => (
          <Lesson
            key={lesson.id || `lesson-${sectionIdx}-${lessonIdx}`}
            lesson={lesson}
            updateLesson={(field: string, value: any) => updateLesson(lessonIdx, field, value)}
            removeLesson={() => removeLesson(lessonIdx)}
            handleFileUpload={(file: File) => handleFileUpload(lessonIdx, file)}
            moveUp={lessonIdx > 0 ? () => moveLessonUp(lessonIdx) : undefined}
            moveDown={lessonIdx < section.lessons.length - 1 ? () => moveLessonDown(lessonIdx) : undefined}
            isLoading={fileLoading[`${sectionIdx}-${lessonIdx}`]}
            errors={errors}
            lessonIdx={lessonIdx}
            sectionIdx={sectionIdx}
            clearPendingFile={() => {
              if (typeof lessonIdx === 'number' && typeof sectionIdx === 'number') {
                updateLesson(lessonIdx, 'pendingFile', null);
              }
            }}
            clearLessonContentError={clearLessonContentError}
            setNotification={setNotification}
          />
        ))}
        
        <button
          type="button"
          onClick={addLesson}
          className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          <TranslatedText text={addLessonText} />
        </button>
      </div>
    </div>
  );
};

export default SectionUI;