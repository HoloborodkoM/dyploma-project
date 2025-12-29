import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import SimulationVideo from './SimulationVideoUI';
import SimulationStepContent from './SimulationStepContentUI';
import { TranslatedText } from '../TranslatedText';

export interface SimulationStep {
  title: string;
  content: string;
  videoUrl: string;
}

interface SimulationModalProps {
  steps: SimulationStep[];
  initialStep?: number;
  onClose: () => void;
  title?: string;
  description?: string;
}

const MIN_SPEED = 0.5;
const MAX_SPEED = 2.0;
const STEP = 0.1;
const MARKS = [0.5, 1, 1.5, 2];

const SimulationModal: React.FC<SimulationModalProps> = ({ steps, initialStep = 0, onClose, title, description }) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [playbackRate, setPlaybackRate] = useState(1);

  const goNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };
  const goPrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };
  const finish = () => {
    onClose();
  };

  return (
    <Modal onClose={onClose} className="w-full h-full max-w-none max-h-none md:w-[80vw] md:max-w-[1000px] md:h-[70vh]">
      <div className="flex flex-col w-full h-full bg-white shadow-lg overflow-auto overscroll-contain md:rounded-lg">
        {title && (
          <div className="px-1 pb-2">
            <h2 className="text-2xl font-bold mb-2"><TranslatedText text={title} /></h2>
            {description && (
              <div className="bg-gray-50 rounded p-1 text-sm max-h-[60px] overflow-auto overscroll-contain border mb-2">
                <TranslatedText text={description} />
              </div>
            )}
          </div>
        )}
        <div className="flex flex-1 w-full h-0 flex-col md:flex-row">
          <div className="w-full md:w-[65%] min-w-0 flex flex-col h-full">
            <div className="flex-1 flex items-center justify-center bg-black">
              <div className="w-full aspect-[16/9] flex items-center justify-center">
                <SimulationVideo
                  videoUrl={steps[currentStep].videoUrl}
                  stepIndex={currentStep}
                  playbackRate={playbackRate}
                />
              </div>
            </div>
            <div className="w-full mt-4 mb-2">
              <div className="relative w-full flex items-center">
                <input
                  type="range"
                  min={MIN_SPEED}
                  max={MAX_SPEED}
                  step={STEP}
                  value={playbackRate}
                  onChange={e => setPlaybackRate(parseFloat(e.target.value))}
                  className="w-full accent-blue-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{ zIndex: 2 }}
                />
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-between w-full z-1 pointer-events-none">
                  {Array.from({ length: Math.round((MAX_SPEED - MIN_SPEED) / 0.1) + 1 }).map((_, idx) => {
                    const val = MIN_SPEED + idx * 0.1;
                    const isMark = MARKS.includes(Number(val.toFixed(1)));
                    return (
                      <div key={val} className={`h-3 ${isMark ? 'w-0.5 bg-blue-600' : 'w-0.5 bg-gray-400'} rounded`} style={{ height: isMark ? 16 : 10 }} />
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-end w-full mt-1">
                <span className="text-xs text-gray-700 font-semibold">{playbackRate.toFixed(1)}x</span>
              </div>
            </div>
          </div>
          <div className="w-full md:w-[35%] min-w-0 max-w-full flex flex-col h-full pl-2 pb-2 pr-1 bg-white">
            <SimulationStepContent
              step={steps[currentStep]}
              stepIndex={currentStep}
              stepsCount={steps.length}
              onNext={goNext}
              onPrev={goPrev}
              onFinish={finish}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SimulationModal;