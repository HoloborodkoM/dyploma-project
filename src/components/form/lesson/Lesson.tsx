import React from 'react';
import LessonLogic from './LessonLogic';
import LessonUI from './LessonUI';
import { Lesson as LessonType } from '../types';

interface LessonProps {
  lesson: LessonType;
  updateLesson: (field: string, value: any) => void;
  removeLesson: () => void;
  handleFileUpload: (file: File) => void;
  moveUp?: () => void;
  moveDown?: () => void;
  isLoading?: boolean;
  errors?: Record<string, string>;
  clearPendingFile?: () => void;
  lessonIdx?: number;
  sectionIdx?: number;
  clearLessonContentError?: (sectionIdx: number, lessonIdx: number) => void;
  setNotification?: React.Dispatch<React.SetStateAction<{ type: 'success' | 'error', message: string } | null>>;
}

const Lesson: React.FC<LessonProps> = ({
  lesson,
  updateLesson,
  removeLesson,
  handleFileUpload,
  moveUp,
  moveDown,
  isLoading,
  errors,
  clearPendingFile,
  lessonIdx,
  sectionIdx,
  clearLessonContentError,
  setNotification
}) => {
  const handleClearPendingFile = () => {
    if (typeof clearPendingFile === 'function') {
      clearPendingFile();
    }
  };

  return (
    <LessonLogic
      lesson={lesson}
      updateLesson={updateLesson}
      removeLesson={removeLesson}
      handleFileUpload={handleFileUpload}
      moveUp={moveUp}
      moveDown={moveDown}
      isLoading={isLoading}
      errors={errors}
      clearPendingFile={handleClearPendingFile}
      lessonIdx={lessonIdx}
      sectionIdx={sectionIdx}
      clearLessonContentError={clearLessonContentError}
      setNotification={setNotification}
    >
      {(lessonProps) => <LessonUI {...lessonProps} />}
    </LessonLogic>
  );
};

export default Lesson;