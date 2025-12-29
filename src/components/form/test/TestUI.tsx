import React from 'react';
import { TestFormState, TestQuestion } from './types';
import { TranslatedText } from '@/components/TranslatedText';

interface TestUIProps {
  state: TestFormState;
  addQuestion: () => void;
  removeQuestion: (index: number) => void;
  updateQuestion: (index: number, field: string, value: any) => void;
  addOption: (questionIndex: number) => void;
  removeOption: (questionIndex: number, optionIndex: number) => void;
  updateOption: (questionIndex: number, optionIndex: number, field: string, value: any) => void;
  setActiveQuestion: (index: number) => void;
  moveQuestionUp: (index: number) => void;
  moveQuestionDown: (index: number) => void;
  translations: {
    questionPlaceholder: string;
    optionPlaceholder: string;
    addQuestionText: string;
    removeQuestionText: string;
    addOptionText: string;
    removeOptionText: string;
    singleChoiceText: string;
    multipleChoiceText: string;
    questionTypeLabel: string;
    correctAnswerText: string;
    moveUpText: string;
    moveDownText: string;
    noQuestionsText: string;
    questionLabelText: string;
  };
  errors: Record<string, string>;
}

const TestUI: React.FC<TestUIProps & { validateAndSaveTest?: () => void, showErrors?: boolean }> = ({
  state,
  addQuestion,
  removeQuestion,
  updateQuestion,
  addOption,
  removeOption,
  updateOption,
  setActiveQuestion,
  moveQuestionUp,
  moveQuestionDown,
  translations,
  errors,
  validateAndSaveTest,
  showErrors = false,
}) => {
  const { questions, activeQuestionIndex } = state;
  const activeQuestion = questions[activeQuestionIndex];

  const errorQuestionIndexes = Object.keys(errors)
    .filter(key => (key.startsWith('question-') || key.startsWith('option-')) && errors[key])
    .map(key => parseInt(key.split('-')[1], 10));

  const questionError = errors[`question-${activeQuestionIndex}`];
  const optionError = errors[`option-${activeQuestionIndex}`];
  const allErrors = [];
  if (showErrors && questionError) allErrors.push(questionError);
  if (showErrors && optionError) allErrors.push(optionError);

  const renderQuestionsList = () => {
    return (
      <div className="min-h-[240px] max-h-[240px] overflow-y-auto overscroll-contain [@media(max-width:300px)]:min-h-[160px] [@media(max-width:300px)]:max-h-[160px]">
        {questions.map((question, index) => (
          <div
            key={question.id}
            className={`p-2 mb-2 rounded cursor-pointer h-10 flex items-center justify-between w-full
              ${showErrors && errorQuestionIndexes.includes(index) ? 'bg-red-50 border-l-4 border-red-500' :
                index === activeQuestionIndex ? 'bg-blue-100 border-l-4 border-blue-500' : 'bg-gray-50 hover:bg-gray-100'}
            `}
            onClick={() => setActiveQuestion(index)}
          >
            <div className="w-10 text-center">
              <span className="font-medium">{index + 1}</span>
            </div>
            <div className="flex items-center justify-center flex-grow">
              {index > 0 ? (
                <button type="button" className="p-1 text-gray-500 hover:text-gray-700 mx-1" title={translations.moveUpText} onClick={e => { e.stopPropagation(); moveQuestionUp(index); }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                </button>
              ) : (<div className="w-7 mx-1"></div>)}
              {index < questions.length - 1 ? (
                <button type="button" className="p-1 text-gray-500 hover:text-gray-700 mx-1" title={translations.moveDownText} onClick={e => { e.stopPropagation(); moveQuestionDown(index); }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </button>
              ) : (<div className="w-7 mx-1"></div>)}
            </div>
            <div className="flex items-center">
              <button type="button" className="p-1 text-red-500 hover:text-red-700" title={translations.removeQuestionText} onClick={e => { e.stopPropagation(); removeQuestion(index); }} disabled={questions.length <= 1}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderQuestionEditor = (question: TestQuestion, questionIndex: number) => {
    return (
      <div className="bg-white p-2 rounded shadow-sm relative">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <TranslatedText text={translations.questionLabelText} />
          </label>
          <input
            type="text"
            value={question.question}
            onChange={(e) => updateQuestion(questionIndex, 'question', e.target.value)}
            placeholder={translations.questionPlaceholder}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {showErrors && errors[`question-${questionIndex}`] && (
            <div className="mt-2 text-xs text-red-500 bg-red-50 border border-red-200 rounded px-2 py-1 min-w-[120px] text-center">
              {errors[`question-${questionIndex}`]}
            </div>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <TranslatedText text={translations.questionTypeLabel} />
          </label>
          <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0 items-center md:items-start">
            <label className="flex flex-col md:flex-row md:items-center">
              <input
                type="radio"
                checked={question.type === 'SINGLE'}
                onChange={() => updateQuestion(questionIndex, 'type', 'SINGLE')}
                className="h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="mt-1 md:mt-0 md:ml-2 text-xs md:text-sm text-center text-gray-700">
                <TranslatedText text={translations.singleChoiceText} />
              </span>
            </label>
            <label className="flex flex-col md:flex-row md:items-center">
              <input
                type="radio"
                checked={question.type === 'MULTIPLE'}
                onChange={() => updateQuestion(questionIndex, 'type', 'MULTIPLE')}
                className="h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="mt-1 md:mt-0 md:ml-2 text-xs md:text-sm text-center text-gray-700">
                <TranslatedText text={translations.multipleChoiceText} />
              </span>
            </label>
          </div>
        </div>
        <div className="mb-0">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2 space-y-2 md:space-y-0">
            <label className="block text-sm font-medium text-gray-700 text-start md:text-left">
              <TranslatedText text="Варіанти відповідей" />
            </label>
            <div className="flex justify-center md:justify-end w-full md:w-auto">
              <button
                type="button"
                onClick={() => addOption(questionIndex)}
                className="w-full justify-center inline-flex items-center px-2.5 py-1.5 border border-transparent text-sm md:text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <TranslatedText text={translations.addOptionText} />
              </button>
            </div>
          </div>
          <div className="space-y-1 min-h-[129px] max-h-[129px] overflow-y-auto overscroll-contain [@media(max-width:300px)]:min-h-[80px] [@media(max-width:300px)]:max-h-[80px]">
            {question.options.map((option, optionIndex) => (
              <div key={option.id} className="flex items-center py-2 border-b border-gray-200 [@media(max-width:300px)]:py-1">
                <div className="mr-2 mt-3">
                  {question.type === 'SINGLE' ? (
                    <input
                      type="radio"
                      checked={option.isCorrect}
                      onChange={() => updateOption(questionIndex, optionIndex, 'isCorrect', true)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                  ) : (
                    <input
                      type="checkbox"
                      checked={option.isCorrect}
                      onChange={e => {
                        if (!e.target.checked) {
                          const checkedCount = question.options.filter(o => o.isCorrect).length;
                          if (checkedCount <= 2 && option.isCorrect) return;
                        }
                        updateOption(questionIndex, optionIndex, 'isCorrect', e.target.checked);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  )}
                </div>
                <div className="flex-grow">
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => updateOption(questionIndex, optionIndex, 'text', e.target.value)}
                    placeholder={translations.optionPlaceholder}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 [@media(max-width:300px)]:p-1 [@media(max-width:300px)]:text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeOption(questionIndex, optionIndex)}
                  disabled={question.options.length <= 2}
                  className="ml-1 mt-0 p-1 text-red-500 hover:text-red-700 disabled:opacity-50"
                  title={translations.removeOptionText}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 [@media(max-width:300px)]:h-4 [@media(max-width:300px)]:w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          {showErrors && errors[`option-${questionIndex}`] && (
            <div className="mt-2 text-xs text-red-500 bg-red-50 border border-red-200 rounded px-2 py-1 min-w-[120px] text-center">
              {errors[`option-${questionIndex}`]}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="test-editor w-full max-w-full [@media(max-width:300px)]:p-0.5">
      <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
        <div className="md:w-2/5 w-full">
          <div className="bg-white p-1 md:p-1 rounded shadow-sm flex flex-col w-full">
            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-2 text-sm md:text-base">
                <TranslatedText text="Питань" /> ({questions.length})
              </h3>
              {questions.length === 0 ? (
                <p className="text-gray-500 italic text-xs md:text-sm">
                  <TranslatedText text={translations.noQuestionsText} />
                </p>
              ) : (
                renderQuestionsList()
              )}
            </div>
            <button
              type="button"
              onClick={addQuestion}
              className="w-full flex justify-center items-center h-10 border border-transparent text-sm md:text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mb-2"
            >
              <span className="flex items-center space-x-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span><TranslatedText text={translations.addQuestionText} /></span>
              </span>
            </button>
            <button
              type="button"
              className="w-full flex justify-center items-center h-10 border border-transparent text-sm md:text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mb-2"
              onClick={validateAndSaveTest}
            >
              <span className="flex items-center space-x-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 13l4 4L19 7" clipRule="evenodd" />
                </svg>
                <span><TranslatedText text="Зберегти" /></span>
              </span>
            </button>
          </div>
        </div>
        <div className="md:w-3/5 w-full">
          {activeQuestion ? (
            <div className="bg-white p-2 rounded shadow-sm w-full">
              {renderQuestionEditor(activeQuestion, activeQuestionIndex)}
            </div>
          ) : (
            <div className="bg-white p-4 rounded shadow-sm w-full">
              <p className="text-gray-500 italic text-center py-4 text-xs md:text-sm">
                <TranslatedText text="Будь ласка, виберіть питання для редагування або додайте нове" />
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestUI;