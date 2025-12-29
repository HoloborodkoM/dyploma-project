import React from 'react';
import SectionLogic from './SectionLogic';
import SectionUI from './SectionUI';
import { Section as SectionType } from '../types';

interface SectionProps {
  section: SectionType;
  sectionIdx: number;
  updateSectionTitle: (sectionIdx: number, value: string) => void;
  addLesson: (sectionIdx: number) => void;
  removeLesson: (sectionIdx: number, lessonIdx: number) => void;
  updateLesson: (sectionIdx: number, lessonIdx: number, field: string, value: any) => void;
  handleFileUpload: (sectionIdx: number, lessonIdx: number, file: File) => void;
  removeSection: (sectionIdx: number) => void;
  moveSection: (fromIdx: number, toIdx: number) => void;
  moveLesson: (sectionIdx: number, fromIdx: number, toIdx: number) => void;
  fileLoading: { [key: string]: boolean };
  errors?: Record<string, string>;
  sectionsLength?: number;
  setNotification?: React.Dispatch<React.SetStateAction<{ type: 'success' | 'error', message: string } | null>>;
}

const Section: React.FC<SectionProps> = ({
  section,
  sectionIdx,
  updateSectionTitle,
  addLesson,
  removeLesson,
  updateLesson,
  handleFileUpload,
  removeSection,
  moveSection,
  moveLesson,
  fileLoading,
  errors,
  sectionsLength,
  setNotification
}) => {
  const canMoveUp = sectionIdx > 0;
  const canMoveDown = sectionsLength ? sectionIdx < sectionsLength - 1 : false;

  return (
    <SectionLogic
      section={section}
      updateSectionTitle={(value) => updateSectionTitle(sectionIdx, value)}
      addLesson={() => addLesson(sectionIdx)}
      removeLesson={(lessonIdx) => removeLesson(sectionIdx, lessonIdx)}
      updateLesson={(lessonIdx, field, value) => updateLesson(sectionIdx, lessonIdx, field, value)}
      handleFileUpload={(lessonIdx, file) => handleFileUpload(sectionIdx, lessonIdx, file)}
      removeSection={() => removeSection(sectionIdx)}
      moveUp={canMoveUp ? () => moveSection(sectionIdx, sectionIdx - 1) : undefined}
      moveDown={canMoveDown ? () => moveSection(sectionIdx, sectionIdx + 1) : undefined}
      moveLessonUp={(lessonIdx) => moveLesson(sectionIdx, lessonIdx, lessonIdx - 1)}
      moveLessonDown={(lessonIdx) => moveLesson(sectionIdx, lessonIdx, lessonIdx + 1)}
      fileLoading={fileLoading}
      errors={errors}
      sectionIdx={sectionIdx}
      setNotification={setNotification}
    >
      {(sectionProps) => <SectionUI {...sectionProps} />}
    </SectionLogic>
  );
};

export default Section;