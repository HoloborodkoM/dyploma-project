import React from 'react';
import TestLogic from './TestLogic';
import TestUI from './TestUI';
import { Test as TestType } from './types';

interface TestProps {
  initialTest?: TestType;
  onChange: (test: TestType) => void;
  errors?: Record<string, string>;
  onSaveTest?: (test: TestType) => void;
}

const Test: React.FC<TestProps> = ({ initialTest, onChange, errors, onSaveTest }) => {
  return (
    <TestLogic 
      initialTest={initialTest} 
      onChange={onChange}
      errors={errors}
      onSaveTest={onSaveTest || (() => {})}
    >
      {props => <TestUI {...props} showErrors={props.showErrors} />}
    </TestLogic>
  );
};

export default Test;