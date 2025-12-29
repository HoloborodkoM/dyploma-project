import React, { useState, useEffect } from 'react';
import { Lesson } from '../types';
import { t } from '@/components/TranslatedText';
import { formatFileName, validateVideoFile, validateDocumentFile } from './lessonUtils';
import { Test as TestType } from '../test/types';

interface LessonLogicProps {
  lesson: Lesson;
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
  children: (props: {
    lesson: Lesson;
    updateLesson: (field: string, value: any) => void;
    removeLesson: () => void;
    handleFileUpload: (file: File) => void;
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
    errors?: Record<string, string>;
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
    handleTestChange: (test: TestType) => void;
    formatFileName: (fileName: string) => string;
    clearLessonContentError?: (sectionIdx: number, lessonIdx: number) => void;
    testDraft: TestType;
    setTestDraft: React.Dispatch<React.SetStateAction<TestType>>;
    isTestEditing: boolean;
    setIsTestEditing: React.Dispatch<React.SetStateAction<boolean>>;
    testSaved: boolean;
    editPlaceholder: string;
    deletePlaceholder: string;
    handleEditTest: () => void;
    handleDeleteTest: () => void;
    handleSaveTest: (test: TestType) => void;
  }) => React.ReactNode;
}

const LessonLogic: React.FC<LessonLogicProps> = ({
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
  setNotification,
  children
}) => {
  function clearLessonError() {
    if (typeof clearLessonContentError === 'function' && sectionIdx !== undefined && lessonIdx !== undefined) {
      clearLessonContentError(sectionIdx, lessonIdx);
    }
  }

  function resetFileFields(type: 'VIDEO' | 'DOCUMENT') {
    if (type === 'VIDEO') {
      updateLesson('videoUrl', '');
      updateLesson('fileName', '');
      updateLesson('tempFileName', '');
    } else if (type === 'DOCUMENT') {
      updateLesson('documentUrl', '');
      updateLesson('fileName', '');
      updateLesson('tempFileName', '');
    }
  }

  function resetLessonFields() {
    updateLesson('content', '');
    updateLesson('videoUrl', '');
    updateLesson('documentUrl', '');
    updateLesson('fileName', '');
    updateLesson('tempFileName', '');
    updateLesson('uploadError', '');
    if (typeof clearPendingFile === 'function') {
      clearPendingFile();
    }
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
      const fileInput = input as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    });
  }

  function getFileNameFromUrl(url: string, fallback: string) {
    return url.split('/').pop() || fallback;
  }

  function setTranslation(key: string, setter: (v: string) => void) {
    t(key, lang).then(setter);
  }

  const [lessonTitlePlaceholder, setLessonTitlePlaceholder] = useState("Назва уроку");
  const [textContentPlaceholder, setTextContentPlaceholder] = useState("Вміст уроку");
  const [typeText, setTypeText] = useState("Текст");
  const [typeVideo, setTypeVideo] = useState("Відео");
  const [typeDocument, setTypeDocument] = useState("Документ");
  const [typeTest, setTypeTest] = useState("Тест");
  const [moveUpTitle, setMoveUpTitle] = useState("Перемістити урок вгору");
  const [moveDownTitle, setMoveDownTitle] = useState("Перемістити урок вниз");
  const [removeLessonTitle, setRemoveLessonTitle] = useState("Видалити урок");
  const [lang, setLang] = useState<'ua' | 'en'>('ua');
  
  const [deleteFileText, setDeleteFileText] = useState("Видалити файл");
  const [uploadVideoText, setUploadVideoText] = useState("Натисніть або перетягніть, щоб завантажити відео");
  const [maxVideoSizeText, setMaxVideoSizeText] = useState("Максимальний розмір: 200MB");
  const [videoDescText, setVideoDescText] = useState("Введіть опис відео");
  const [uploadDocText, setUploadDocText] = useState("Натисніть або перетягніть, щоб завантажити документ");
  const [supportedDocTypesText, setSupportedDocTypesText] = useState("Підтримуються: PDF, DOC, DOCX, XLS, PPT, зображення, текстові файли");
  const [maxDocSizeText, setMaxDocSizeText] = useState("Максимальний розмір: 50MB");
  const [docDescText, setDocDescText] = useState("Введіть опис документа");
  const [optionalText, setOptionalText] = useState("необов'язково");
  
  const [invalidVideoFormatText, setInvalidVideoFormatText] = useState("Файл повинен бути у відео форматі");
  const [videoSizeExceededText, setVideoSizeExceededText] = useState("Розмір файлу перевищує максимально допустимий розмір (200MB)");
  const [invalidDocFormatText, setInvalidDocFormatText] = useState("Несумісний формат файлу");
  const [docSizeExceededText, setDocSizeExceededText] = useState("Розмір файлу перевищує максимально допустимий розмір (50MB)");
  const [editPlaceholder, setEditPlaceholder] = useState("Редагувати");
  const [deletePlaceholder, setDeletePlaceholder] = useState("Видалити");
     
  const [lessonTitleError, setLessonTitleError] = useState<string | undefined>(undefined);
  const [lessonContentError, setLessonContentError] = useState<string | undefined>(undefined);

  const [testDraft, setTestDraft] = useState<TestType>(() => {
    if (lesson.type === 'TEST' && lesson.test) {
      return lesson.test;
    }
    return {} as TestType;
  });

  const [testSaved, setTestSaved] = useState<boolean>(lesson.type === 'TEST' && !!lesson.test);
  const [isTestEditing, setIsTestEditing] = useState(
    lesson.type === 'TEST' && (!lesson.test || !Array.isArray(lesson.test.questions) || lesson.test.questions.length === 0)
  );
  
  useEffect(() => {
    if (lesson.type === 'TEST' && lesson.testSaved !== testSaved) {
      updateLesson('testSaved', testSaved);
    }
  }, [testSaved, lesson.type]);

  useEffect(() => {
    if (lesson.type === 'TEST' && lesson.testSaved === undefined) {
      setTestSaved(false);
      updateLesson('testSaved', false);
    }
  }, []);

  useEffect(() => {
    if (lesson.type === 'TEST' && lesson.test && Array.isArray(lesson.test.questions) && lesson.test.questions.length > 0) {
      setTestSaved(true);
    }
  }, []);

  useEffect(() => {
    const currentLang = typeof window !== 'undefined' ? localStorage.getItem('preferredLanguage') : 'ua';
    setLang(currentLang === 'en' ? 'en' : 'ua');
  }, []);

  useEffect(() => {
    setTranslation("Назва уроку", setLessonTitlePlaceholder);
    setTranslation("Вміст уроку", setTextContentPlaceholder);
    setTranslation("Текст", setTypeText);
    setTranslation("Відео", setTypeVideo);
    setTranslation("Документ", setTypeDocument);
    setTranslation("Тест", setTypeTest);
    setTranslation("Перемістити урок вгору", setMoveUpTitle);
    setTranslation("Перемістити урок вниз", setMoveDownTitle);
    setTranslation("Видалити урок", setRemoveLessonTitle);
    setTranslation("Видалити файл", setDeleteFileText);
    setTranslation("Натисніть або перетягніть, щоб завантажити відео", setUploadVideoText);
    setTranslation("Максимальний розмір: 200MB", setMaxVideoSizeText);
    setTranslation("Введіть опис відео", setVideoDescText);
    setTranslation("Натисніть або перетягніть, щоб завантажити документ", setUploadDocText);
    setTranslation("Підтримуються: PDF, DOC, DOCX, XLS, PPT, зображення, текстові файли", setSupportedDocTypesText);
    setTranslation("Максимальний розмір: 50MB", setMaxDocSizeText);
    setTranslation("Введіть опис документа", setDocDescText);
    setTranslation("необов'язково", setOptionalText);
    setTranslation("Файл повинен бути у відео форматі", setInvalidVideoFormatText);
    setTranslation("Розмір файлу перевищує максимально допустимий розмір (200MB)", setVideoSizeExceededText);
    setTranslation("Несумісний формат файлу", setInvalidDocFormatText);
    setTranslation("Розмір файлу перевищує максимально допустимий розмір (50MB)", setDocSizeExceededText);
    setTranslation("Редагувати", setEditPlaceholder);
    setTranslation("Видалити", setDeletePlaceholder);
  }, [lang]);
  
  useEffect(() => {
    if (sectionIdx !== undefined && lessonIdx !== undefined) {
      const titleErrorKey = `lesson-${sectionIdx}-${lessonIdx}`;
      const contentErrorKey = `content-${sectionIdx}-${lessonIdx}`;
      
      if (errors && errors[titleErrorKey]) {
        t(errors[titleErrorKey], lang).then(setLessonTitleError);
      } else if (errors && errors.lesson) {
        t(errors.lesson, lang).then(setLessonTitleError);
      } else {
        setLessonTitleError(undefined);
      }
      
      if (errors && errors[contentErrorKey]) {
        t(errors[contentErrorKey], lang).then(setLessonContentError);
      } else if (errors && errors.content) {
        t(errors.content, lang).then(setLessonContentError);
      } else {
        setLessonContentError(undefined);
      }
    } else {
      if (errors && errors.lesson) {
        t(errors.lesson, lang).then(setLessonTitleError);
      } else {
        setLessonTitleError(undefined);
      }
      
      if (errors && errors.content) {
        t(errors.content, lang).then(setLessonContentError);
      } else {
        setLessonContentError(undefined);
      }
    }
  }, [errors, lang, sectionIdx, lessonIdx]);

  useEffect(() => {
    if (!lesson.tempFileName) {
      if (lesson.type === 'VIDEO' && lesson.videoUrl) {
        const name = getFileNameFromUrl(lesson.videoUrl, 'video');
        updateLesson('tempFileName', name);
      } else if (lesson.type === 'DOCUMENT' && lesson.documentUrl) {
        const name = getFileNameFromUrl(lesson.documentUrl, 'document');
        updateLesson('tempFileName', name);
      }
    }
  }, [lesson.type, lesson.videoUrl, lesson.documentUrl, lesson.tempFileName, updateLesson]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateLesson('title', e.target.value);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateLesson('content', e.target.value);
  };
  
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateLesson('uploadError', '');
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateVideoFile(file, invalidVideoFormatText, videoSizeExceededText);
    if (!validation.valid) {
      updateLesson('uploadError', validation.error);
      e.target.value = '';
      return;
    }
    updateLesson('tempFileName', file.name);
    handleFileUpload(file);
  };
  
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateLesson('uploadError', '');
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateDocumentFile(file, invalidDocFormatText, docSizeExceededText);
    if (!validation.valid) {
      updateLesson('uploadError', validation.error);
      e.target.value = '';
      return;
    }
    updateLesson('tempFileName', file.name);
    handleFileUpload(file);
  };
  
  const handleDeleteFile = () => {
    updateLesson('uploadError', '');
    resetFileFields(lesson.type as 'VIDEO' | 'DOCUMENT');
    clearLessonError();
    if (typeof clearPendingFile === 'function') {
      clearPendingFile();
    }
  };
  
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    clearLessonError();
    resetLessonFields();
    updateLesson('type', e.target.value);
    if (e.target.value === 'TEST') {
      setIsTestEditing(true);
      setTestSaved(false);
      setTestDraft({} as TestType);
    }
    const event = new CustomEvent('lessonTypeChanged', {
      detail: { lessonId: lesson.id }
    });
    document.dispatchEvent(event);
  };
  
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateLesson('content', e.target.value);
  };
  
  const handleTestChange = (test: TestType) => {
    setTestDraft(test);
    setTestSaved(false);
    updateLesson('content', JSON.stringify(test));
    clearLessonError();
  };

  const handleSaveTest = (test: TestType) => {
    setTestDraft(test);
    updateLesson('test', test);
    setTestSaved(true);
    setIsTestEditing(false);
    if (setNotification) {
      setNotification({ type: 'success', message: 'Тест успішно збережено!' });
    }
    clearLessonError();
  };

  const handleEditTest = () => {
    setIsTestEditing(true);
    setTestSaved(false);
    clearLessonError();
  };

  const handleDeleteTest = () => {
    setTestDraft({} as TestType);
    updateLesson('content', '');
    setTestSaved(false);
    setIsTestEditing(true);
    clearLessonError();
    if (typeof sectionIdx === 'number' && typeof lessonIdx === 'number') {
      updateLesson('errors', {
        ...((lesson as any).errors || {}),
        [`content-${sectionIdx}-${lessonIdx}`]: undefined
      });
    }
  };

  const handleRemoveLesson = () => {
    clearLessonError();
    removeLesson();
  };

  return children({
    lesson,
    updateLesson,
    removeLesson: handleRemoveLesson,
    handleFileUpload,
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
    errors,
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
    handleTestChange,
    formatFileName,
    clearLessonContentError,
    testDraft,
    setTestDraft,
    isTestEditing,
    setIsTestEditing,
    testSaved,
    editPlaceholder,
    deletePlaceholder,
    handleEditTest,
    handleDeleteTest,
    handleSaveTest,
  });
};

export default LessonLogic;