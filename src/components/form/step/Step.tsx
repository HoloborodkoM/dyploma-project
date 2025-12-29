import React from 'react';
import StepLogic from './StepLogic';
import StepUI from './StepUI';

interface StepProps {
  step: any;
  stepIdx: number;
  updateStep: (idx: number, field: string, value: any) => void;
  removeStep: (idx: number) => void;
  handleFileUpload: (stepIdx: number, file: File) => void;
  moveStep: (fromIdx: number, toIdx: number) => void;
  stepsLength: number;
  errors: Record<string, string>;
  setNotification: (n: any) => void;
  clearStepError: (key: string) => void;
  fileLoading?: boolean;
  videoSuccess?: boolean;
}

const Step: React.FC<StepProps> = (props) => {
  return (
    <StepLogic {...props} fileLoading={props.fileLoading}>
      {(logicProps) => <StepUI {...logicProps} />}
    </StepLogic>
  );
};

export default Step;