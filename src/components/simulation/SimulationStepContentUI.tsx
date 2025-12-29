import React from 'react';
import { TranslatedText } from '../TranslatedText';

interface SimulationStepContentUIProps {
  step: { title: string; content: string };
  stepIndex: number;
  stepsCount: number;
  onNext: () => void;
  onPrev: () => void;
  onFinish: () => void;
}

const SimulationStepContentUI: React.FC<SimulationStepContentUIProps> = ({
  step,
  stepIndex,
  stepsCount,
  onNext,
  onPrev,
  onFinish
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-lg font-bold mb-2"><TranslatedText text={`Крок ${stepIndex + 1}:`} /> <br /> <TranslatedText text={step.title} /></h3>
      </div>
      <div className="flex-1 overflow-auto min-h-[100px] bg-gray-50 rounded pt-0 pb-0 p-3 text-sm overscroll-contain">
        <TranslatedText text={step.content} />
      </div>
      <div className="flex justify-between mt-2 ml-4 mr-4">
        {stepIndex > 0 && (
          <button className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={onPrev}>
            <TranslatedText text="Назад" />
          </button>
        )}
        {stepIndex < stepsCount - 1 ? (
          <button className="ml-auto px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={onNext}>
            <TranslatedText text="Далі" />
          </button>
        ) : (
          <button className="ml-auto px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700" onClick={onFinish}>
            <TranslatedText text="Завершити" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SimulationStepContentUI;