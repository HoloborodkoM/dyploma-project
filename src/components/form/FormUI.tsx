import React from 'react';
import { FormState } from './types';
import { TranslatedText } from '@/components/TranslatedText';
import Modal from '@/components/Modal';
import Section from './section/Section';
import Step from './step/Step';
import Keywords from './keywords/Keywords';
import Notification from '../Notification';

interface FormUIProps {
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
}

const FormUI: React.FC<FormUIProps> = ({
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
  moveStep,
  handleRemoveKeyword,
  moveSection,
  moveLesson,
  fileInputRef,
  imageDropAreaRef,
  submitText,
  isSubmitting,
  notification,
  setNotification,
  resetImage,
  clearStepError
}) => {

  const getStepErrors = (idx: number) => {
    const errors = { ...state.errors };
    if (type === 'simulation' && state.pendingFiles && state.pendingFiles[idx]) {
      const errKey = `step-videoUrl-${idx}`;
      if (errors[errKey]) delete errors[errKey];
    }
    return errors;
  };

  return (
    <>
      {notification && (
        <Notification type={notification.type} message={notification.message} onClose={() => setNotification(null)} />
      )}
      <form onSubmit={handleSubmit} className="w-full max-w-full p-1 sm:p-2 md:p-4 [@media(max-width:300px)]:p-0.5">
        {state.showCancelModal && (
          <Modal onClose={() => handleChange('showCancelModal', false)}>
            <div className="p-4 w-full max-w-md mx-auto">
              <h2 className="text-xl font-bold mb-4 text-center text-red-600"><TranslatedText text="Скасувати зміни?" /></h2>
              <p className="mb-6 text-center"><TranslatedText text="Ви впевнені, що хочете скасувати всі внесені зміни?" /></p>
              <div className="flex justify-center space-x-3">
                <button className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors" onClick={() => handleChange('showCancelModal', false)}><TranslatedText text="Назад" /></button>
                <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors" onClick={confirmCancel}><TranslatedText text="Так" /></button>
              </div>
            </div>
          </Modal>
        )}

        <div className="mb-4">
          <label htmlFor="title" className="block mb-2 text-sm md:text-base font-medium">
            <TranslatedText text={type === 'course' ? "Назва курсу" : "Назва симуляції"} />
          </label>
          <input
            type="text"
            id="title"
            value={state.title}
            onChange={e => handleChange('title', e.target.value)}
            placeholder={titlePlaceholder}
            className={`w-full p-2 md:p-3 border rounded ${state.errors.title ? 'border-red-500' : 'border-gray-300'} text-sm md:text-base`}
            disabled={isSubmitting}
            maxLength={100}
          />
          <div className="flex justify-between">
            {state.errors.title && <p className="text-red-500 text-xs md:text-sm mt-1"><TranslatedText text={state.errors.title} /></p>}
            <p className="text-gray-500 text-xs md:text-sm mt-1 ml-auto">{state.title.length}/100</p>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="text-sm font-medium mb-2 flex flex-wrap items-center gap-x-1">
            <TranslatedText text={type === 'course' ? "Зображення курсу" : "Зображення симуляції"} />
            <span className="text-gray-400 text-xs">(<TranslatedText text="необов'язково" />)</span>
          </div>
          <div 
            ref={imageDropAreaRef}
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors flex flex-col justify-center items-center h-full text-center"
            onClick={handleImageClick}
            style={{ minHeight: '160px' }}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
            />
            
            {state.imageUrl ? (
              <div className="relative w-full">
                <img 
                  src={state.imageUrl} 
                  className="max-h-48 mx-auto object-contain rounded" 
                  alt={type === 'course' ? "Зображення курсу" : "Зображення симуляції"} 
                />
                <button 
                  type="button"
                  className="absolute top-0 right-0 bg-white rounded-full p-1 shadow-md"
                  onClick={(e) => { 
                    e.stopPropagation();
                    resetImage();
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
                {state.imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
                    <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-500 h-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="[@media(max-width:210px)]:hidden"><TranslatedText text="Натисніть або перетягніть, щоб завантажити зображення" /></p>
                <p className="text-xs mt-1 [@media(max-width:210px)]:hidden"><TranslatedText text="Підтримуються тільки файли зображень, максимум 10MB" /></p>
                <span className="inline [@media(min-width:211px)]:hidden text-xs text-gray-500 mt-1 flex items-center justify-center">
                  <span className="ml-1">&lt;10МБ</span>
                </span>
              </div>
            )}
          </div>
          {state.errors.image && (
            <div className="mt-2 flex items-center text-red-500 bg-red-50 p-2 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium"><TranslatedText text={state.errors.image} /></span>
              <button 
                type="button"
                className="ml-auto text-red-500 hover:text-red-700"
                onClick={() => {
                  handleChange('errors', { ...state.errors, image: '' });
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
              </button>
            </div>
          )}
          
          {!state.imageLoading && state.imageUrl && !state.errors.image && !state.pendingImage && (
            <div className="mt-2 flex items-center text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs"><TranslatedText text="Зображення успішно завантажено" /></span>
            </div>
          )}
          
          {state.imageLoading && (
            <div className="mt-2 flex items-center text-blue-500">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-xs"><TranslatedText text="Завантаження зображення..." /></span>
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block mb-2 text-sm font-medium flex flex-wrap items-center gap-x-1">
            <TranslatedText text={type === 'course' ? "Опис курсу" : "Опис симуляції"} />
            <span className="text-gray-400 text-xs">(<TranslatedText text="необов'язково" />)</span>
          </label>
          <textarea
            id="description"
            className="w-full p-3 border rounded border-gray-300 overflow-y-auto overscroll-contain"
            value={state.description}
            onChange={e => handleChange('description', e.target.value)}
            placeholder={descriptionPlaceholder}
            rows={3}
            disabled={isSubmitting}
            maxLength={1000}
          />
          <div className="flex justify-between">
            {state.errors.description && <p className="text-red-500 text-sm mt-1">{state.errors.description}</p>}
            <p className="text-gray-500 text-xs mt-1 ml-auto">{state.description.length}/1000</p>
          </div>
        </div>
        
        <Keywords
          keywords={state.keywords}
          updateKeywords={(keywords) => handleChange('keywords', keywords)}
          removeKeyword={handleRemoveKeyword}
        />
        
        {type === 'course' ? (
          <>
            <div className="mb-4 p-2 md:p-3 bg-blue-50 text-blue-800 border border-blue-200 rounded text-xs md:text-sm break-words">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium"><TranslatedText text="Підказка по навігації" /></span>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                <li><TranslatedText text="Ви можете змінювати порядок розділів і уроків, використовуючи стрілки вгору та вниз" /></li>
                <li><TranslatedText text="Для переміщення розділу використовуйте стрілки біля назви розділу" /></li>
                <li><TranslatedText text="Для переміщення уроку використовуйте стрілки зліва від назви уроку" /></li>
              </ul>
            </div>
            <div className="space-y-4">
              {state.sections?.map((section, sIdx) => (
                <Section 
                  key={sIdx}
                  section={section}
                  sectionIdx={sIdx}
                  updateSectionTitle={updateSectionTitle}
                  addLesson={addLesson}
                  removeLesson={removeLesson}
                  updateLesson={updateLesson}
                  handleFileUpload={handleSectionFileUpload}
                  removeSection={removeSection}
                  moveSection={moveSection}
                  moveLesson={moveLesson}
                  fileLoading={state.fileLoading}
                  errors={state.errors}
                  sectionsLength={state.sections?.length || 0}
                  setNotification={setNotification}
                />
              ))}
            </div>
            <div className="mt-4">
              <button 
                type="button" 
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded mr-2 hover:bg-gray-200"
                onClick={addSection}
              >
                <TranslatedText text="+ Додати розділ" />
              </button>
            </div>
            {state.errors.course && (
              <div className="mt-3 text-sm text-red-500"><TranslatedText text={state.errors.course} /></div>
            )}
          </>
        ) : (
          <>
            <div className="mb-4 p-2 md:p-3 bg-blue-50 text-blue-800 border border-blue-200 rounded text-xs md:text-sm break-words">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium"><TranslatedText text="Підказка по навігації" /></span>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                <li><TranslatedText text="Ви можете змінювати порядок кроків, використовуючи стрілки вгору та вниз" /></li>
              </ul>
            </div>
            <div className="space-y-4">
              {state.steps?.map((step, idx) => (
                <Step
                  key={idx}
                  step={step}
                  stepIdx={idx}
                  updateStep={updateStep!}
                  removeStep={removeStep!}
                  handleFileUpload={handleStepFileUpload!}
                  moveStep={moveStep!}
                  stepsLength={state.steps?.length || 0}
                  errors={getStepErrors(idx)}
                  setNotification={setNotification}
                  clearStepError={clearStepError}
                  fileLoading={state.fileLoading[idx]}
                />
              ))}
            </div>
            <div className="mt-4">
              <button 
                type="button" 
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded mr-2 hover:bg-gray-200"
                onClick={addStep}
              >
                <TranslatedText text="+ Додати крок" />
              </button>
            </div>
            {state.errors.simulation && (
              <div className="mt-3 text-sm text-red-500"><TranslatedText text={state.errors.simulation} /></div>
            )}
          </>
        )}
        
        <div className="mt-6 flex justify-end space-x-2 [@media(max-width:300px)]:flex-col [@media(max-width:300px)]:space-x-0 [@media(max-width:300px)]:space-y-1 [@media(max-width:300px)]:w-full">
          <button
            type="button"
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 w-full"
            onClick={handleCancel}
          >
            <TranslatedText text="Скасувати" />
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300 w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? <TranslatedText text="Завантаження..." /> : <TranslatedText text={submitText} />}
          </button>
        </div>
      </form>
    </>
  );
};

export default FormUI;