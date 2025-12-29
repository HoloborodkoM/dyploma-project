import React, { useState, useEffect } from 'react';
import { t } from '@/components/TranslatedText';

interface StepLogicProps {
  step: any;
  stepIdx: number;
  updateStep: (idx: number, field: string, value: any) => void;
  removeStep: (idx: number) => void;
  handleFileUpload: (stepIdx: number, file: File) => void;
  moveStep: (fromIdx: number, toIdx: number) => void;
  stepsLength: number;
  errors: Record<string, string>;
  setNotification: (n: any) => void;
  clearStepError?: (key: string) => void;
  fileLoading?: boolean;
  children: (props: {
    videoPreviewUrl: string;
    onVideoChange: (file: File) => void;
    onTitleChange: (v: string) => void;
    onContentChange: (v: string) => void;
    onRemove: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    title: string;
    content: string;
    titleError?: string;
    contentError?: string;
    videoError?: string;
    canMoveUp: boolean;
    canMoveDown: boolean;
    onRemoveVideo: () => void;
    fileLoading?: boolean;
    step: any;
    titlePlaceholder: string;
    contentPlaceholder: string;
    moveUpTitle: string;
    moveDownTitle: string;
    removeTitle: string;
  }) => React.ReactNode;
}

async function getVideoThumbnail(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.src = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      video.currentTime = 0;
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png'));
      } else {
        resolve(null);
      }
      URL.revokeObjectURL(video.src);
    };

    video.onerror = () => resolve(null);
  });
}

const StepLogic: React.FC<StepLogicProps> = ({
  step, 
  stepIdx, 
  updateStep, 
  removeStep, 
  handleFileUpload, 
  moveStep, 
  stepsLength, 
  errors, 
  setNotification, 
  clearStepError,
  fileLoading = false,
  children
}) => {
  const [lang, setLang] = useState<'ua' | 'en'>('ua');
  const [titleError, setTitleError] = useState<string | undefined>(undefined);
  const [contentError, setContentError] = useState<string | undefined>(undefined);
  const [videoError, setVideoError] = useState<string | undefined>(undefined);

  const [titlePlaceholder, setTitlePlaceholder] = useState<string>('Введіть назву кроку');
  const [contentPlaceholder, setContentPlaceholder] = useState<string>('Введіть опис кроку');
  const [moveUpTitle, setMoveUpTitle] = useState<string>('Перемістити вгору');
  const [moveDownTitle, setMoveDownTitle] = useState<string>('Перемістити вниз');
  const [removeTitle, setRemoveTitle] = useState<string>('Видалити крок');

  useEffect(() => {
    const currentLang = typeof window !== 'undefined' ? localStorage.getItem('preferredLanguage') : 'ua';
    setLang(currentLang === 'en' ? 'en' : 'ua');
  }, []);

  useEffect(() => {
    t('Введіть назву кроку', lang).then(setTitlePlaceholder);
    t('Введіть опис кроку', lang).then(setContentPlaceholder);
    t('Перемістити вгору', lang).then(setMoveUpTitle);
    t('Перемістити вниз', lang).then(setMoveDownTitle);
    t('Видалити крок', lang).then(setRemoveTitle);
  }, [lang]);

  useEffect(() => {
    if (stepIdx !== undefined && errors) {
      const titleErrorKey = `step-title-${stepIdx}`;
      const contentErrorKey = `step-content-${stepIdx}`;
      const videoErrorKey = `step-videoUrl-${stepIdx}`;
  
      if (errors[titleErrorKey]) {
        t(errors[titleErrorKey], lang).then(setTitleError);
      } else {
        setTitleError(undefined);
      }
      if (errors[contentErrorKey]) {
        t(errors[contentErrorKey], lang).then(setContentError);
      } else {
        setContentError(undefined);
      }
      if (errors[videoErrorKey]) {
        t(errors[videoErrorKey], lang).then(setVideoError);
      } else {
        setVideoError(undefined);
      }
    }
  }, [errors, lang, stepIdx]);

  const onTitleChange = (v: string) => {
    updateStep(stepIdx, 'title', v);
    if (titleError) setTitleError(undefined);
    if (clearStepError) clearStepError(`step-title-${stepIdx}`);
  };

  const onContentChange = (v: string) => {
    updateStep(stepIdx, 'content', v);
    if (contentError) setContentError(undefined);
    if (clearStepError) clearStepError(`step-content-${stepIdx}`);
  };

  const onVideoChange = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      setNotification({ type: 'error', message: 'Дозволені лише відеофайли' });
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setNotification({ type: 'error', message: 'Максимальний розмір відео — 50MB' });
      return;
    }
    handleFileUpload(stepIdx, file);
    if (clearStepError) clearStepError(`step-videoUrl-${stepIdx}`);
    const thumb = await getVideoThumbnail(file);
    if (thumb) {
      updateStep(stepIdx, 'videoPreviewUrl', thumb);
    }
    if (videoError) setVideoError(undefined);
  };

  const onRemoveVideo = () => {
    updateStep(stepIdx, 'videoPreviewUrl', '');
    updateStep(stepIdx, 'videoUrl', '');
  };

  return children({
    videoPreviewUrl: step.videoPreviewUrl || '',
    onVideoChange,
    onTitleChange,
    onContentChange,
    onRemove: () => removeStep(stepIdx),
    onMoveUp: () => stepIdx > 0 && moveStep(stepIdx, stepIdx - 1),
    onMoveDown: () => stepIdx < stepsLength - 1 && moveStep(stepIdx, stepIdx + 1),
    title: step.title,
    content: step.content,
    titleError,
    contentError,
    videoError,
    canMoveUp: stepIdx > 0,
    canMoveDown: stepIdx < stepsLength - 1,
    onRemoveVideo,
    fileLoading,
    step,
    titlePlaceholder,
    contentPlaceholder,
    moveUpTitle,
    moveDownTitle,
    removeTitle
  });
};

export default StepLogic;