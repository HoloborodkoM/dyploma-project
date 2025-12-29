import React from 'react';
import FormLogic from './FormLogic';
import FormUI from './FormUI';
import { Course, Section, Simulation, Step } from './types';

interface FormProps {
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
  onSuccess?: (message: string) => void;
  entityId?: string | number;
}

const Form: React.FC<FormProps> = ({ 
  type,
  initialData, 
  initialTitle,
  initialDescription,
  initialImageUrl,
  initialKeywords,
  initialSections,
  initialSteps,
  onCancel,
  submitText,
  user,
  onSuccess,
  entityId
}) => {
  return (
    <FormLogic 
      type={type}
      initialData={initialData}
      initialTitle={initialTitle}
      initialDescription={initialDescription}
      initialImageUrl={initialImageUrl}
      initialKeywords={initialKeywords}
      initialSections={initialSections}
      initialSteps={initialSteps}
      onCancel={onCancel}
      submitText={submitText}
      user={user}
      onSuccess={onSuccess}
      entityId={entityId}
    >
      {(logicProps) => <FormUI {...logicProps} />}
    </FormLogic>
  );
};

export default Form;