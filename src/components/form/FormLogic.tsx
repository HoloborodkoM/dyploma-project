import React, { useState, useEffect, useRef } from 'react';
import { Course, Section, Simulation, Step, FormState } from './types';
import { fetchWithAuth } from '@/utils/auth';
import { t } from '../TranslatedText';
import {
  swapSectionFiles,
  swapSectionErrors,
  removeSectionPendingFiles,
  swapLessonFiles,
  swapLessonErrors,
  removeLessonPendingFile
} from './utils/courseFormUtils';
import {
  swapStepFiles,
  swapStepErrors
} from './utils/simulationFormUtils';

interface FormLogicProps {
  type: 'course' | 'simulation';
  initialData?: Course | Simulation;
  initialTitle?: string;
  initialDescription?: string;
  initialImageUrl?: string;
  initialKeywords?: string[];
  initialSections?: Section[];
  initialSteps?: Step[];
  onCancel?: () => void;
  submitText?: string;
  user?: any;
  notification?: { type: 'success' | 'error', message: string } | null;
  setNotification?: React.Dispatch<React.SetStateAction<{ type: 'success' | 'error', message: string } | null>>;
  onSuccess?: (message: string) => void;
  entityId?: string | number;
  children: (props: {
    type: 'course' | 'simulation';
    state: FormState;
    handleChange: (field: string, value: any) => void;
    handleSubmit: (e: React.FormEvent) => void;
    handleImageUpload: (file: File) => void;
    handleImageClick: () => void;
    handleCancel: () => void;
    confirmCancel: () => void;
    titlePlaceholder: string;
    descriptionPlaceholder: string;
    addSection: () => void;
    removeSection: (idx: number) => void;
    updateSectionTitle: (idx: number, value: string) => void;
    addLesson: (sectionIdx: number) => void;
    removeLesson: (sectionIdx: number, lessonIdx: number) => void;
    updateLesson: (sectionIdx: number, lessonIdx: number, field: string, value: any) => void;
    handleSectionFileUpload: (sectionIdx: number, lessonIdx: number, file: File) => void;
    addStep?: () => void;
    removeStep?: (idx: number) => void;
    updateStep?: (idx: number, field: string, value: any) => void;
    handleStepFileUpload?: (stepIdx: number, file: File) => void;
    moveStep?: (fromIdx: number, toIdx: number) => void;
    moveSection: (fromIdx: number, toIdx: number) => void;
    moveLesson: (sectionIdx: number, fromIdx: number, toIdx: number) => void;
    handleAddKeyword: () => void;
    handleRemoveKeyword: (index: number) => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    imageDropAreaRef: React.RefObject<HTMLDivElement>;
    submitText: string;
    isSubmitting: boolean;
    notification: { type: 'success' | 'error', message: string } | null;
    setNotification: React.Dispatch<React.SetStateAction<{ type: 'success' | 'error', message: string } | null>>;
    resetImage: () => void;
    clearStepError: (key: string) => void;
  }) => React.ReactNode;
}

const FormLogic: React.FC<FormLogicProps> = ({ 
  type,
  initialData,
  initialTitle = '',
  initialDescription = '',
  initialImageUrl = '',
  initialKeywords = [],
  initialSections = [{ title: '', lessons: [] }],
  initialSteps = [{ title: '', content: '', videoUrl: ''}],
  onCancel,
  submitText = 'Створити',
  user,
  notification: externalNotification,
  setNotification: externalSetNotification,
  onSuccess,
  entityId,
  children 
}) => {
  const [state, setState] = useState<FormState>({
    title: initialData?.title || initialTitle,
    description: initialData?.description || initialDescription,
    keywords: initialData?.keywords || initialKeywords,
    imageUrl: initialData?.imageUrl || initialImageUrl,
    sections: type === 'course' && initialData && 'sections' in initialData
      ? initialData.sections || initialSections
      : initialSections,
    steps: type === 'simulation' && initialData && 'steps' in initialData
      ? initialData.steps || initialSteps
      : initialSteps,
    editingTitle: false,
    editingDescription: false,
    pendingImage: null,
    pendingFiles: {},
    errors: {},
    imageLoading: false,
    fileLoading: {},
    loading: false,
    showCancelModal: false
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageDropAreaRef = useRef<HTMLDivElement>(null);
  const [notification, setNotification] = externalSetNotification
    ? [externalNotification, externalSetNotification]
    : useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [showTestError, setShowTestError] = useState(false);

  const [lang, setLang] = useState<'ua' | 'en'>('ua');
  const [titlePlaceholder, setTitlePlaceholder] = useState("Введіть назву");
  const [descriptionPlaceholder, setDescriptionPlaceholder] = useState("Введіть опис");

  useEffect(() => {
    console.log('STATE CHANGED', state);
  }, [state]);

  useEffect(() => {
    const currentLang = typeof window !== 'undefined' ? localStorage.getItem('preferredLanguage') : 'ua';
    setLang(currentLang === 'en' ? 'en' : 'ua');
  }, []);

  useEffect(() => {
    t("Введіть назву", lang).then(setTitlePlaceholder);
    t("Введіть опис", lang).then(setDescriptionPlaceholder);
  }, [lang]);

  useEffect(() => {
    const dropArea = imageDropAreaRef.current;
    if (!dropArea) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dropArea.classList.add('border-blue-500', 'bg-blue-50');
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dropArea.classList.remove('border-blue-500', 'bg-blue-50');
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dropArea.classList.remove('border-blue-500', 'bg-blue-50');
      
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        handleImageUpload(file);
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
  }, []);

  useEffect(() => {
    const isDirty = () => {

      const initial = (initialData || {}) as any;
      if ((state.title || '') !== (initial.title || initialTitle || '')) return true;
      if ((state.description || '') !== (initial.description || initialDescription || '')) return true;
      if ((state.imageUrl || '') !== (initial.imageUrl || initialImageUrl || '')) return true;
      if (JSON.stringify(state.keywords || []) !== JSON.stringify(initial.keywords || initialKeywords || [])) return true;
      if (state.pendingImage) return true;

      if (type === 'course') {
        const initialSectionsArr = initial.sections || initialSections || [{ title: '', lessons: [] }];
        if (JSON.stringify(state.sections) !== JSON.stringify(initialSectionsArr)) return true;
      }

      if (type === 'simulation') {
        const initialStepsArr = initial.steps || initialSteps || [{ title: '', content: '', videoUrl: ''}];
        if (JSON.stringify(state.steps) !== JSON.stringify(initialStepsArr)) return true;
      }
      return false;
    };
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty()) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [
    state.title, state.description, state.sections, state.steps, state.imageUrl, state.keywords, state.pendingImage,
    initialTitle, initialDescription, initialImageUrl, initialKeywords, initialSections, initialSteps, initialData, type
  ]);

  const handleChange = (field: string, value: any) => {
    const updatedErrors = { ...state.errors };
    
    if (field === 'title' && updatedErrors.title) {
      delete updatedErrors.title;
    }
    
    setState(prev => ({
      ...prev,
      [field]: value,
      errors: updatedErrors
    }));
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, image: 'Дозволені лише файли зображень' }
      }));
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, image: 'Максимальний розмір зображення - 10MB' }
      }));
      return;
    }
    
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, image: '' },
      pendingImage: file
    }));
      
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (result) {
        setState(prev => ({
          ...prev,
          imageUrl: result as string
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  function shiftErrorsAfterRemove(
    errors: Record<string, string>, 
    type: 'section' | 'lesson' | 'step', 
    sectionIdx: number, 
    lessonIdx?: number,
    stepIdx?: number
  ) {
    const updatedErrors = { ...errors };
    Object.keys(updatedErrors).forEach(key => {
      if (type === 'section' && (key.startsWith(`section-${sectionIdx}`) || key.match(new RegExp(`^lesson-${sectionIdx}-`)) || key.match(new RegExp(`^content-${sectionIdx}-`)))) {
        delete updatedErrors[key];
      }
      if (type === 'lesson' && (key === `lesson-${sectionIdx}-${lessonIdx}` || key === `content-${sectionIdx}-${lessonIdx}`)) {
        delete updatedErrors[key];
      }
      if (type === 'step' && (key === `step-title-${stepIdx}` || key === `step-content-${stepIdx}`)) {
        delete updatedErrors[key];
      }
    });

    const newErrors: Record<string, string> = {};
    Object.keys(updatedErrors).forEach(key => {
      const sectionMatch = key.match(/^section-(\d+)/);
      const lessonMatch = key.match(/^lesson-(\d+)-(\d+)/);
      const contentMatch = key.match(/^content-(\d+)-(\d+)/);
      const stepTitleMatch = key.match(/^step-title-(\d+)/);
      const stepContentMatch = key.match(/^step-content-(\d+)/);
      const stepVideoUrlMatch = key.match(/^step-videoUrl-(\d+)/);

      if (type === 'section' && sectionMatch && Number(sectionMatch[1]) > sectionIdx) {
        newErrors[`section-${Number(sectionMatch[1]) - 1}`] = updatedErrors[key];
      } else if (type === 'section' && lessonMatch && Number(lessonMatch[1]) > sectionIdx) {
        newErrors[`lesson-${Number(lessonMatch[1]) - 1}-${lessonMatch[2]}`] = updatedErrors[key];
      } else if (type === 'section' && contentMatch && Number(contentMatch[1]) > sectionIdx) {
        newErrors[`content-${Number(contentMatch[1]) - 1}-${contentMatch[2]}`] = updatedErrors[key];
      } else if (type === 'lesson' && lessonMatch && Number(lessonMatch[1]) === sectionIdx && Number(lessonMatch[2]) > (lessonIdx ?? -1)) {
        newErrors[`lesson-${sectionIdx}-${Number(lessonMatch[2]) - 1}`] = updatedErrors[key];
      } else if (type === 'lesson' && contentMatch && Number(contentMatch[1]) === sectionIdx && Number(contentMatch[2]) > (lessonIdx ?? -1)) {
        newErrors[`content-${sectionIdx}-${Number(contentMatch[2]) - 1}`] = updatedErrors[key];
      }

      else if (type === 'step' && stepTitleMatch && Number(stepTitleMatch[1]) > sectionIdx) {
        newErrors[`step-title-${Number(stepTitleMatch[1]) - 1}`] = updatedErrors[key];
      } else if (type === 'step' && stepContentMatch && Number(stepContentMatch[1]) > sectionIdx) {
        newErrors[`step-content-${Number(stepContentMatch[1]) - 1}`] = updatedErrors[key];
      } else if (type === 'step' && stepVideoUrlMatch && Number(stepVideoUrlMatch[1]) > sectionIdx) {
        newErrors[`step-videoUrl-${Number(stepVideoUrlMatch[1]) - 1}`] = updatedErrors[key];
      }
      
      else if (!sectionMatch && !lessonMatch && !contentMatch && !stepTitleMatch && !stepContentMatch && !stepVideoUrlMatch) {
        newErrors[key] = updatedErrors[key];
      } else {
        newErrors[key] = updatedErrors[key];
      }
    });
    return newErrors;
  }

  function moveItem<T>(arr: T[], fromIdx: number, toIdx: number): T[] {
    const copy = [...arr];
    const [removed] = copy.splice(fromIdx, 1);
    copy.splice(toIdx, 0, removed);
    return copy;
  }

  const addSection = () => {
    setState(prev => ({
      ...prev,
      sections: [...(prev.sections || []), { title: '', lessons: [] }]
    }));
  };

  const removeSection = (idx: number) => {
    const newErrors = shiftErrorsAfterRemove(state.errors, 'section', idx);
    setState(prev => ({
      ...prev,
      sections: prev.sections?.filter((_, i) => i !== idx) || [],
      errors: newErrors,
      pendingFiles: removeSectionPendingFiles(prev.pendingFiles, idx)
    }));
  };
  
  const updateSectionTitle = (idx: number, value: string) => {
    const updatedErrors = { ...state.errors };
    if (updatedErrors[`section-${idx}`]) {
      delete updatedErrors[`section-${idx}`];
    }
    
    setState(prev => ({
      ...prev,
      sections: prev.sections?.map((s, i) => i === idx ? { ...s, title: value } : s) || [],
      errors: updatedErrors
    }));
  };
  
  const addLesson = (sectionIdx: number) => {
    const updatedErrors = { ...state.errors };
    if (updatedErrors.course) {
      delete updatedErrors.course;
    }
    
    setState(prev => ({
      ...prev,
      sections: prev.sections?.map((s, i) => i === sectionIdx ? 
        { ...s, lessons: [...s.lessons, { title: '', type: 'TEXT', content: '', fileUrl: '' }] } : s) || [],
      errors: updatedErrors
    }));
  };
  
  const removeLesson = (sectionIdx: number, lessonIdx: number) => {
    const newErrors = shiftErrorsAfterRemove(state.errors, 'lesson', sectionIdx, lessonIdx);
    setState(prev => ({
      ...prev,
      sections: prev.sections?.map((s, i) => i === sectionIdx ? 
        { ...s, lessons: s.lessons.filter((_, j) => j !== lessonIdx) } : s) || [],
      errors: newErrors,
      pendingFiles: removeLessonPendingFile(prev.pendingFiles, sectionIdx, lessonIdx)
    }));
  };
  
  const updateLesson = (sectionIdx: number, lessonIdx: number, field: string, value: any) => {
    const updatedErrors = { ...state.errors };
    
    if (field === 'title') {
      delete updatedErrors[`lesson-${sectionIdx}-${lessonIdx}`];
      delete updatedErrors.lesson;
    }
    
    if (field === 'content' || field === 'type') {
      delete updatedErrors[`content-${sectionIdx}-${lessonIdx}`];
      delete updatedErrors.content;
    }
    
    if (field === 'type') {
      const currentLesson = state.sections?.[sectionIdx]?.lessons?.[lessonIdx];
      if (currentLesson && (currentLesson.videoUrl || currentLesson.documentUrl || currentLesson.fileName)) {
        if (state.pendingFiles[`${sectionIdx}-${lessonIdx}`]) {
          setState(prev => {
            const newPendingFiles = removeLessonPendingFile(prev.pendingFiles, sectionIdx, lessonIdx);
            return {
              ...prev,
              pendingFiles: newPendingFiles,
              errors: updatedErrors,
              sections: prev.sections?.map((s, i) => 
                i === sectionIdx ? { 
                  ...s, 
                  lessons: s.lessons.map((l, j) => 
                    j === lessonIdx ? { 
                      ...l, 
                      [field]: value,
                      fileUrl: '',
                      videoUrl: '',
                      documentUrl: '',
                      fileName: '' 
                    } : l
                  ) 
                } : s
              )
            };
          });
          return;
        }
      }
      delete updatedErrors[`content-${sectionIdx}-${lessonIdx}`];
    }
    
    if ((field === 'videoUrl' || field === 'documentUrl') && value === '') {
      setState(prev => {
        const newPendingFiles = removeLessonPendingFile(prev.pendingFiles, sectionIdx, lessonIdx);
        return {
          ...prev,
          sections: prev.sections?.map((s, i) => i === sectionIdx ?
            { ...s, lessons: s.lessons.map((l, j) => j === lessonIdx ? { ...l, [field]: value } : l) } : s) || [],
          errors: updatedErrors,
          pendingFiles: newPendingFiles
        };
      });
      return;
    }
    
    setState(prev => ({
      ...prev,
      sections: prev.sections?.map((s, i) => i === sectionIdx ? 
        { ...s, lessons: s.lessons.map((l, j) => j === lessonIdx ? 
          { ...l, [field]: value } : l) } : s) || [],
      errors: updatedErrors
    }));
  };
  
  const handleSectionFileUpload = (sectionIdx: number, lessonIdx: number, file: File) => {
    const updatedErrors = { ...state.errors };
    delete updatedErrors[`content-${sectionIdx}-${lessonIdx}`];

    setState(prev => ({
      ...prev,
      pendingFiles: {
        ...prev.pendingFiles,
        [`${sectionIdx}-${lessonIdx}`]: file
      },
      errors: updatedErrors
    }));
  };

  const addStep = () => {
    setState(prev => ({
      ...prev,
      steps: [...(prev.steps || []), { title: '', content: '', videoUrl: ''}]
    }));
  };

  const removeStep = (idx: number) => {
    const newErrors = shiftErrorsAfterRemove(state.errors, 'step', idx);
    const newPendingFiles = { ...state.pendingFiles };
    
    if (newPendingFiles[`${idx}`]) {
      delete newPendingFiles[`${idx}`];
    }

    const shiftedPendingFiles: Record<string, File> = {};
    Object.keys(newPendingFiles).forEach(key => {
      const keyNum = Number(key);
      if (keyNum > idx) {
        shiftedPendingFiles[`${keyNum - 1}`] = newPendingFiles[key];
      } else if (keyNum < idx) {
        shiftedPendingFiles[key] = newPendingFiles[key];
      }
    });

    setState(prev => ({
      ...prev,
      steps: prev.steps?.filter((_, i) => i !== idx) || [],
      errors: newErrors,
      pendingFiles: shiftedPendingFiles
    }));
  };

  const updateStep = (stepIdx: number, field: string, value: any) => {
    const updatedErrors = { ...state.errors };
    let newPendingFiles = { ...state.pendingFiles };

    if (field === 'title') {
      delete updatedErrors[`step-title-${stepIdx}`];
    }
    if (field === 'content') {
      delete updatedErrors[`step-content-${stepIdx}`];
      delete updatedErrors.content;
    }
    if (field === 'videoUrl') {
      delete updatedErrors[`step-videoUrl-${stepIdx}`];
      delete updatedErrors.videoUrl;
      delete newPendingFiles[`${stepIdx}`];
    }

    setState(prev => {
      return {
        ...prev,
        steps: prev.steps?.map((s, i) =>
          i === stepIdx ? { ...s, [field]: value } : s
        ) || [],
        errors: updatedErrors,
        pendingFiles: field === 'videoUrl' ? newPendingFiles : prev.pendingFiles
      };
    });
  };

  const handleStepFileUpload = (stepIdx: number, file: File) => {
    setState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[`step-videoUrl-${stepIdx}`];
      const newPendingFiles = {
        ...prev.pendingFiles,
        [`${stepIdx}`]: file
      };
      return {
        ...prev,
        pendingFiles: newPendingFiles,
        errors: newErrors
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state.loading) return;

    const validationErrors: Record<string, string> = {};

    if (type === 'course') {
      state.sections?.forEach((section, sectionIdx) => {
        section.lessons.forEach((lesson, lessonIdx) => {
          const pendingKey = `${sectionIdx}-${lessonIdx}`;
          const hasPendingFile = !!state.pendingFiles[pendingKey];
          if (!lesson.title?.trim()) {
            validationErrors[`lesson-${sectionIdx}-${lessonIdx}`] = 'Вкажіть назву уроку';
          }
          if (lesson.type === 'VIDEO' && !lesson.videoUrl && !hasPendingFile) {
            validationErrors[`content-${sectionIdx}-${lessonIdx}`] = 'Завантажте відео для уроку';
          }
          if (lesson.type === 'DOCUMENT' && !lesson.documentUrl && !hasPendingFile) {
            validationErrors[`content-${sectionIdx}-${lessonIdx}`] = 'Завантажте документ для уроку';
          }
          if (lesson.type === 'TEXT' && !lesson.content?.trim()) {
            validationErrors[`content-${sectionIdx}-${lessonIdx}`] = 'Вміст уроку не може бути порожнім';
          }
          if (lesson.type === 'TEST') {
            if (!lesson.test || !lesson.test.questions || lesson.test.questions.length === 0) {
              validationErrors[`content-${sectionIdx}-${lessonIdx}`] = 'Тест не було збережено';
            }
          }
        });
      });
    }

    if (type === 'simulation') {
      state.steps?.forEach((step, stepIdx) => {
        const pendingKey = `${stepIdx}`;
        const hasPendingFile = !!state.pendingFiles[pendingKey];
        if (!step.title?.trim()) {
          validationErrors[`step-title-${stepIdx}`] = 'Вкажіть назву кроку';
        }
        if (!step.content?.trim()) {
          validationErrors[`step-content-${stepIdx}`] = 'Вкажіть опис кроку';
        }
        if (!step.videoUrl && !hasPendingFile) {
          validationErrors[`step-videoUrl-${stepIdx}`] = 'Завантажте відео для кроку';
        }
      });
    }

    if (!state.title.trim()) {
      validationErrors.title = type === 'course'
        ? 'Назва курсу не може бути порожньою'
        : 'Назва симуляції не може бути порожньою';
    }

    if (type === 'course') {
      let hasLessons = false;
      state.sections?.forEach((section, sIdx) => {
        if (!section.title.trim()) {
          validationErrors[`section-${sIdx}`] = 'Назва розділу не може бути порожньою';
        }
        if (section.lessons.length > 0) {
          hasLessons = true;
        }
      });
      if (!hasLessons) {
        validationErrors.course = 'Додайте хоча б один урок до курсу';
      }
    }

    if (type === 'simulation') {
      if (!state.steps || state.steps.length === 0) {
        validationErrors.simulation = 'Додайте хоча б один крок до симуляції';
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      const hasTestError = Object.keys(validationErrors).some(key => key.startsWith('content-') && validationErrors[key] === 'Тест не було збережено');
      if (hasTestError) setShowTestError(true);
      setState(prev => ({
        ...prev,
        errors: validationErrors
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true }));
    setNotification(null);

    const currentLang = localStorage.getItem('preferredLanguage') || 'ua';
      const formDataForCheck = {
        title: state.title,
        lang: currentLang,
      };

      let slugCheckUrl = '';
      let method = entityId ? 'PUT' : 'POST';
      if (type === 'course') {
        slugCheckUrl = entityId 
          ? `/api/courses/${entityId}` 
          : '/api/courses/control';
      } else {
        slugCheckUrl = entityId 
          ? `/api/simulations/${entityId}` 
          : '/api/simulations/control';
      }

      const slugCheckRes = await fetchWithAuth(slugCheckUrl, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'X-Only-Check-Slug': 'true'
        },
        body: JSON.stringify(formDataForCheck)
      });

      if (slugCheckRes.status === 409) {
        const errorData = await slugCheckRes.json();
        setNotification({ type: 'error', message: errorData.error });
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

    try {
      let finalImageUrl = state.imageUrl;
      let updatedSections = JSON.parse(JSON.stringify(state.sections));
      let updatedSteps = JSON.parse(JSON.stringify(state.steps));
      
      const totalLessons = updatedSections.reduce(
        (sum: number, section: Section) => sum + (section.lessons?.length || 0),
        0
      );
      
      const initialFileLoading: Record<string, boolean> = {};
      Object.keys(state.pendingFiles).forEach(key => {
        initialFileLoading[key] = true;
      });
      
      if (Object.keys(initialFileLoading).length > 0) {
        setState(prev => ({
          ...prev,
          fileLoading: initialFileLoading
        }));
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (state.pendingImage) {
        setState(prev => ({ ...prev, imageLoading: true }));
        const formData = new FormData();
        formData.append('file', state.pendingImage);
        formData.append('fileType', 'images');
        
        if (initialTitle && type === 'course') {
          formData.append('courseId', String(user?.editingCourseId || ''));
          formData.append('courseTitle', state.title);
        } else if (initialTitle && type === 'simulation') {
          formData.append('simulationId', String(user?.editingSimulationId || ''));
          formData.append('simulationTitle', state.title);
        }
        
        try {
          const res = await fetchWithAuth('/api/upload', {
            method: 'POST',
            body: formData,
          });
          
          if (!res.ok) {
            const errorData = await res.json();
            const errorMessage = errorData.error;
            
            setState(prev => ({ 
              ...prev, 
              imageLoading: false, 
              errors: { ...prev.errors, image: errorMessage }
            }));
            return;
          } else {
            const data = await res.json();
            finalImageUrl = data.url;
            
            setState(prev => ({ 
              ...prev, 
              imageLoading: false,
              imageUrl: data.url
            }));
          }
        } catch (e) {
          setState(prev => ({ 
            ...prev, 
            imageLoading: false, 
            errors: { ...prev.errors, image: 'Сталася помилка при завантаженні зображення' }
          }));
          return;
        }
      }
      
      let hasFileUploadError = false;
      const remainingPendingFiles = { ...state.pendingFiles };
      
      for (const key in state.pendingFiles) {
        let sectionIdx = 0, lessonIdx = 0, stepIdx = 0;
        if (type === 'course') [sectionIdx, lessonIdx] = key.split('-').map(Number);
        if (type === 'simulation') [stepIdx] = key.split('-').map(Number);
        const file = state.pendingFiles[key];
        
        if (file) {
          let lesson = null, step = null;
          if (type === 'course') lesson = updatedSections[sectionIdx].lessons[lessonIdx];
          if (type === 'simulation') step = updatedSteps[stepIdx];
          const formData = new FormData();
          
          if (type === 'course') formData.append('fileType', lesson.type === 'VIDEO' ? 'videos' : 'documents');
          if (type === 'simulation') formData.append('fileType', 'videos');
          formData.append('file', file);
          
          if (initialTitle) {
            formData.append('courseId', String(user?.editingCourseId || ''));
            formData.append('courseTitle', state.title);
          } else if (initialTitle && type === 'simulation') {
            formData.append('simulationId', String(user?.editingSimulationId || ''));
            formData.append('simulationTitle', state.title);
          }
          
          try {
            const res = await fetchWithAuth('/api/upload', {
              method: 'POST',
              body: formData,
            });
            
            if (!res.ok) {
              const errorData = await res.json();
              const errorMessage = errorData.error;
              
              hasFileUploadError = true;
              
              setState(prev => {
                const updatedSections = JSON.parse(JSON.stringify(prev.sections));
                const updatedSteps = JSON.parse(JSON.stringify(prev.steps));
                if (type === 'course') {
                  const lessonToUpdate = updatedSections[sectionIdx]?.lessons[lessonIdx];
                  if (lessonToUpdate) {
                    lessonToUpdate.uploadError = errorMessage;
                  }
                } else if (type === 'simulation') {
                  const stepToUpdate = updatedSteps[stepIdx];
                  if (stepToUpdate) {
                    stepToUpdate.uploadError = errorMessage;
                  }
                }
                
                return {
                  ...prev,
                  sections: updatedSections,
                  steps: updatedSteps,
                  errors: {
                    ...prev.errors, 
                    [`content-${sectionIdx}-${lessonIdx}`]: errorMessage,
                    [`content-${stepIdx}`]: errorMessage
                  },
                  fileLoading: { 
                    ...prev.fileLoading, 
                    [`${sectionIdx}-${lessonIdx}`]: false,
                    [`${stepIdx}`]: false
                  }
                };
              });
              
              continue;
            }
            
            const data = await res.json();
            if (type === 'course') {
              if (lesson.type === 'VIDEO') lesson.videoUrl = data.url;
              else if (lesson.type === 'DOCUMENT') lesson.documentUrl = data.url;
              lesson.fileUrl = data.url;
              lesson.fileName = file.name || data.fileName || '';
            } else if (type === 'simulation') {
              step.videoUrl = data.url;
              step.fileUrl = data.url;
              step.fileName = file.name || data.fileName || '';
            }
            
            setState(prev => {
              const updatedSections = JSON.parse(JSON.stringify(prev.sections));
              const updatedSteps = JSON.parse(JSON.stringify(prev.steps));
              
              if (type === 'course') {
                const lessonToUpdate = updatedSections[sectionIdx]?.lessons[lessonIdx];
                if (lessonToUpdate) {
                  if (lesson.type === 'VIDEO') lessonToUpdate.videoUrl = data.url;
                  else if (lesson.type === 'DOCUMENT') lessonToUpdate.documentUrl = data.url;
                  lessonToUpdate.fileUrl = data.url;
                  lessonToUpdate.fileName = file.name || data.fileName || '';
                  lessonToUpdate.uploadError = null;
                }
              } else if (type === 'simulation') {
                const stepToUpdate = updatedSteps[stepIdx];
                if (stepToUpdate) {
                  stepToUpdate.videoUrl = data.url;
                  stepToUpdate.fileUrl = data.url;
                  stepToUpdate.fileName = file.name || data.fileName || '';
                  stepToUpdate.uploadError = null;
                }
              }

              return {
                ...prev,
                sections: updatedSections,
                steps: updatedSteps,
                fileLoading: { 
                  ...prev.fileLoading, 
                  [`${sectionIdx}-${lessonIdx}`]: false,
                  [`${stepIdx}`]: false
                }
              };
            });
            
            if (type === 'course') {
              if ((lesson.type === 'VIDEO' && lesson.videoUrl) || 
                  (lesson.type === 'DOCUMENT' && lesson.documentUrl)) {
                delete remainingPendingFiles[key];
              }
            } else if (type === 'simulation') {
              if (step.videoUrl) {
                delete remainingPendingFiles[key];
              }
            }

          } catch (e) {
            const errorMessage = 'Сталася помилка при завантаженні файлу';
            
            hasFileUploadError = true;
            
            setState(prev => {
              const updatedSections = JSON.parse(JSON.stringify(prev.sections));
              const updatedSteps = JSON.parse(JSON.stringify(prev.steps));
              if (type === 'course') {
                const lessonToUpdate = updatedSections[sectionIdx]?.lessons[lessonIdx];
                if (lessonToUpdate) {
                  lessonToUpdate.uploadError = errorMessage;
                }
              } else if (type === 'simulation') {
                const stepToUpdate = updatedSteps[stepIdx];
                if (stepToUpdate) {
                  stepToUpdate.uploadError = errorMessage;
                }
              }
              
              return {
                ...prev,
                sections: updatedSections,
                steps: updatedSteps,
                errors: {
                  ...prev.errors, 
                  [`content-${sectionIdx}-${lessonIdx}`]: errorMessage,
                  [`content-${stepIdx}`]: errorMessage
                },
                fileLoading: { 
                  ...prev.fileLoading, 
                  [`${sectionIdx}-${lessonIdx}`]: false,
                  [`${stepIdx}`]: false
                }
              };
            });
          }
        }
      }
      
      if (hasFileUploadError) {
        setState(prev => ({ 
          ...prev, 
          loading: false,
          pendingFiles: remainingPendingFiles
        }));
        return;
      }
      
      const formData = type === 'course' ? {
        title: state.title,
        description: state.description,
        imageUrl: finalImageUrl,
        keywords: state.keywords,
        totalLessons,
        lang: currentLang,
        sections: updatedSections.map((section: Section, order: number) => ({
          title: section.title,
          order,
          lessons: section.lessons.map((lesson: any, lorder: number) => ({
            title: lesson.title,
            type: lesson.type,
            content: lesson.content || '',
            order: lorder,
            test: lesson.type === 'TEST' ? lesson.test : undefined,
            videoUrl: lesson.type === 'VIDEO' ? lesson.videoUrl : undefined,
            documentUrl: lesson.type === 'DOCUMENT' ? lesson.documentUrl : undefined,
            fileName: lesson.fileName || ''
          }))
        }))
      } : {
        title: state.title,
        description: state.description,
        imageUrl: finalImageUrl,
        keywords: state.keywords,
        lang: currentLang,
        steps: updatedSteps.map((step: Step, order: number) => ({
          title: step.title,
          content: step.content,
          videoUrl: step.videoUrl,
          videoPreviewUrl: step.videoPreviewUrl,
          order
        }))
      };
      
      let res: any = undefined;
      if (entityId && type === 'course') {
        res = await fetchWithAuth(`/api/courses/${entityId}?lang=${currentLang}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
          headers: { 'Content-Type': 'application/json' },
        });
      } else if (entityId && type === 'simulation') {
        res = await fetchWithAuth(`/api/simulations/${entityId}?lang=${currentLang}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
          headers: { 'Content-Type': 'application/json' },
        });
      } else if (type === 'course') {
        res = await fetchWithAuth(`/api/courses/control?lang=${currentLang}`, {
          method: 'POST',
          body: JSON.stringify(formData),
          headers: { 'Content-Type': 'application/json' },
        });
      } else if (type === 'simulation') {
        res = await fetchWithAuth(`/api/simulations/control?lang=${currentLang}`, {
          method: 'POST',
          body: JSON.stringify(formData),
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      const data = await res.json();
      if (res.status === 409 || res.status === 401) {
        (setNotification || (() => {}))({ type: 'error', message: data.error });
        setState(prev => ({ ...prev, loading: false }));
        return;
      }
      if (res.ok) {
        (setNotification || (() => {}))({ type: 'success', message: data.message });
        setState(prev => ({ ...prev, loading: false }));
        if (onSuccess) onSuccess(data.message);
        return;
      } else {
        (setNotification || (() => {}))({ type: 'error', message: data.error });
        setState(prev => ({ ...prev, loading: false }));
        return;
      }
    } catch (error: any) {
      (setNotification || (() => {}))({ type: 'error', message: error?.message || 'Сталася помилка' });
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleCancel = () => {
    setState(prev => ({ ...prev, showCancelModal: true }));
  };

  const confirmCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleAddKeyword = () => {
  };

  const handleRemoveKeyword = (index: number) => {
    setState(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index)
    }));
  };

  const moveSection = (fromIdx: number, toIdx: number) => {
    setState(prev => {
      const newSections = moveItem(prev.sections || [], fromIdx, toIdx);
      const newErrors = swapSectionErrors(prev.errors, fromIdx, toIdx);
      const newPendingFiles = swapSectionFiles(prev.pendingFiles, fromIdx, toIdx);
      return {
        ...prev,
        sections: newSections,
        pendingFiles: newPendingFiles,
        errors: newErrors
      };
    });
  };

  const moveLesson = (sectionIdx: number, fromIdx: number, toIdx: number) => {
    setState(prev => {
      const newSections = [...(prev.sections || [])];
      const section = { ...newSections[sectionIdx] };
      section.lessons = moveItem(section.lessons, fromIdx, toIdx);
      newSections[sectionIdx] = section;
      const newPendingFiles = swapLessonFiles(prev.pendingFiles, sectionIdx, fromIdx, toIdx);
      const newErrors = swapLessonErrors(prev.errors, sectionIdx, fromIdx, toIdx);
      return {
        ...prev,
        sections: newSections,
        pendingFiles: newPendingFiles,
        errors: newErrors
      };
    });
  };

  const moveStep = (fromIdx: number, toIdx: number) => {
    setState(prev => {
      const newSteps = moveItem(prev.steps || [], fromIdx, toIdx);
      const newPendingFiles = swapStepFiles(prev.pendingFiles, fromIdx, toIdx);
      const newErrors = swapStepErrors(prev.errors, fromIdx, toIdx);
      return {
        ...prev,
        steps: newSteps,
        pendingFiles: newPendingFiles,
        errors: newErrors
      };
    });
  };

  const resetImage = () => {
    setState(prev => ({
      ...prev,
      imageUrl: '',
      pendingImage: null,
      errors: { ...prev.errors, image: '' },
      imageLoading: false
    }));
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearStepError = (key: string) => {
    setState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[key];
      return { ...prev, errors: newErrors };
    });
  };

  return children({
    type,
    state,
    handleChange,
    handleSubmit,
    handleImageUpload,
    handleImageClick,
    handleCancel,
    confirmCancel,
    titlePlaceholder,
    descriptionPlaceholder,
    addSection,
    removeSection,
    updateSectionTitle,
    addLesson,
    removeLesson,
    updateLesson,
    handleSectionFileUpload,
    addStep,
    removeStep,
    updateStep,
    handleStepFileUpload,
    handleAddKeyword,
    handleRemoveKeyword,
    moveSection,
    moveStep,
    moveLesson,
    fileInputRef,
    imageDropAreaRef,
    submitText,
    isSubmitting: state.loading,
    notification: notification || null,
    setNotification: setNotification as React.Dispatch<React.SetStateAction<{ type: 'success' | 'error', message: string } | null>>,
    resetImage,
    clearStepError,
  });
};

export default FormLogic;