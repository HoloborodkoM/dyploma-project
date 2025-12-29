import React, { useState, useEffect } from 'react';
import { Section } from '../types';
import { t } from '@/components/TranslatedText';

interface SectionLogicProps {
  section: Section;
  updateSectionTitle: (value: string) => void;
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
  errors?: Record<string, string>;
  sectionIdx?: number;
  setNotification?: React.Dispatch<React.SetStateAction<{ type: 'success' | 'error', message: string } | null>>;
  children: (props: {
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
    errors?: Record<string, string>;
    sectionError?: string;
    sectionTitlePlaceholder: string;
    addLessonText: string;
    moveUpTitle: string;
    moveDownTitle: string;
    removeSectionTitle: string;
    emptyLessonsText: string;
    handleSectionTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    sectionIdx?: number;
    setNotification?: React.Dispatch<React.SetStateAction<{ type: 'success' | 'error', message: string } | null>>;
  }) => React.ReactNode;
}

const SectionLogic: React.FC<SectionLogicProps> = ({
  section,
  updateSectionTitle,
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
  errors,
  sectionIdx,
  setNotification,
  children
}) => {
  const [sectionTitlePlaceholder, setSectionTitlePlaceholder] = useState("Назва розділу");
  const [addLessonText, setAddLessonText] = useState("Додати урок");
  const [moveUpTitle, setMoveUpTitle] = useState("Перемістити розділ вгору");
  const [moveDownTitle, setMoveDownTitle] = useState("Перемістити розділ вниз");
  const [removeSectionTitle, setRemoveSectionTitle] = useState("Видалити розділ");
  const [emptyLessonsText, setEmptyLessonsText] = useState("Додайте уроки до цього розділу");
  const [lang, setLang] = useState<'ua' | 'en'>('ua');
  
  const [sectionError, setSectionError] = useState<string | undefined>(undefined);

  useEffect(() => {
    const currentLang = typeof window !== 'undefined' ? localStorage.getItem('preferredLanguage') : 'ua';
    setLang(currentLang === 'en' ? 'en' : 'ua');
  }, []);

  useEffect(() => {
    t("Назва розділу", lang).then(setSectionTitlePlaceholder);
    t("Додати урок", lang).then(setAddLessonText);
    t("Перемістити розділ вгору", lang).then(setMoveUpTitle);
    t("Перемістити розділ вниз", lang).then(setMoveDownTitle);
    t("Видалити розділ", lang).then(setRemoveSectionTitle);
    t("Додайте уроки до цього розділу", lang).then(setEmptyLessonsText);
  }, [lang]);
  
  useEffect(() => {
    if (sectionIdx !== undefined && errors) {
      const sectionErrorKey = `section-${sectionIdx}`;
      
      if (errors[sectionErrorKey]) {
        t(errors[sectionErrorKey], lang).then(setSectionError);
      } else if (errors.section) {
        t(errors.section, lang).then(setSectionError);
      } else {
        setSectionError(undefined);
      }
    } else if (errors && errors.section) {
      t(errors.section, lang).then(setSectionError);
    } else {
      setSectionError(undefined);
    }
  }, [errors, lang, sectionIdx]);
  
  const handleSectionTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSectionTitle(e.target.value);
  };

  return children({
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
    errors,
    sectionError,
    sectionTitlePlaceholder,
    addLessonText,
    moveUpTitle,
    moveDownTitle,
    removeSectionTitle,
    emptyLessonsText,
    handleSectionTitleChange,
    sectionIdx,
    setNotification
  });
};

export default SectionLogic;