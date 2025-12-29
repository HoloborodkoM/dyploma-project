import React, { useState } from 'react';
import { TranslatedText } from '@/components/TranslatedText';

interface Question {
  id: number;
  text: string;
  type: 'single' | 'multiple';
  options: { id: number; text: string }[];
  correctAnswers: number[];
}

interface LessonTestUIProps {
  title: string;
  questions: Question[];
  onExit: () => void;
  onComplete: (result: any) => void;
  completed: boolean;
  result?: any;
  onTestFinished?: () => void;
}

const getAnswerStatus = (user: number[], correct: number[], type: 'single' | 'multiple') => {
  if (type === 'single') {
    if (user.length === 0) return null;
    return user[0] === correct[0] ? 'correct' : 'wrong';
  } else {
    if (user.length === 0) return null;
    const correctSet = new Set(correct);
    const userSet = new Set(user);
    const intersection = [...userSet].filter(x => correctSet.has(x));
    if (intersection.length === correct.length && user.length === correct.length) return 'correct';
    if (intersection.length > 0) return 'partial';
    return 'wrong';
  }
};

const getStatusLabel = (status: string | null) => {
  if (status === 'correct') return 'Правильна відповідь';
  if (status === 'wrong') return 'Неправильна відповідь';
  if (status === 'partial') return 'Частково правильна відповідь';
  return '';
};

const getStatusColor = (status: string | null) => {
  if (status === 'correct') return 'bg-green-100 border-green-400';
  if (status === 'wrong') return 'bg-red-100 border-red-400';
  if (status === 'partial') return 'bg-orange-100 border-orange-400';
  return 'bg-white border-gray-200';
};

const LessonTestUI: React.FC<LessonTestUIProps> = ({ 
  title, 
  questions, 
  onExit, 
  onComplete, 
  completed, 
  result, 
  onTestFinished 
}) => {
  const [userAnswers, setUserAnswers] = useState<{ [qid: number]: number[] }>({});
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState('');
  const [testResult, setTestResult] = useState<any>(null);

  const handleOptionChange = (qid: number, oid: number, type: 'single' | 'multiple') => {
    setUserAnswers(prev => {
      if (type === 'single') {
        return { ...prev, [qid]: [oid] };
      } else {
        const prevArr = prev[qid] || [];
        if (prevArr.includes(oid)) {
          return { ...prev, [qid]: prevArr.filter(id => id !== oid) };
        } else {
          return { ...prev, [qid]: [...prevArr, oid] };
        }
      }
    });
  };

  const handleSubmit = () => {
    for (const q of questions) {
      if (!userAnswers[q.id] || userAnswers[q.id].length === 0) {
        setError('Усі тестові завдання обовʼязкові');
        return;
      }
    }
    setError('');
    let correct = 0;
    let partial = 0;
    questions.forEach(q => {
      const status = getAnswerStatus(userAnswers[q.id], q.correctAnswers, q.type);
      if (status === 'correct') correct++;
      else if (status === 'partial') partial++;
    });
    setTestResult({ total: questions.length, correct, partial });
    setShowResult(true);
    if (typeof onTestFinished === 'function') {
      onTestFinished();
    }
  };

  const isDone = completed || showResult;

  return (
    <div className="flex flex-col h-full overflow-auto overscroll-contain">
      <h2 className="text-2xl font-bold mb-2 text-blue-900 break-words">
        <TranslatedText text={title} />
      </h2>
      <div className="flex-1 mb-6 space-y-6 min-h-[100px] overflow-auto pr-2 overscroll-contain">
        {isDone && (testResult || result) && (
          <div className="mb-4 p-3 rounded border bg-blue-50 text-blue-700 font-semibold text-center">
            <TranslatedText text="Результат" />: {((result || testResult).correct ?? 0)}/{(result || testResult).total} <TranslatedText text="правильних" />, {(result || testResult).partial ?? 0} <TranslatedText text="частково правильних" />
          </div>
        )}
        {questions.map(q => {
          const status = isDone ? getAnswerStatus(userAnswers[q.id] || [], q.correctAnswers, q.type) : null;
          return (
            <div key={q.id} className={`p-3 rounded-xl border ${getStatusColor(status)} mb-2 transition-all duration-300 w-full`}>
              <div className="font-semibold mb-2 break-words text-base sm:text-lg">
                <TranslatedText text={q.text} />
              </div>
              {isDone && status && (
                <div className={`mb-1 text-sm font-semibold ${
                  status === 'correct' ? 'text-green-700' : status === 'wrong' ? 'text-red-700' : 'text-orange-700'
                }`}>
                  <TranslatedText text={getStatusLabel(status)} />
                </div>
              )}
              <div className={`flex flex-col w-full space-y-2${(showResult || completed) ? ' mt-2' : ''} ${(showResult || completed) ? 'pl-0 ml-0' : ''}`}>
                {q.options.map(opt => {
                  const checked = (userAnswers[q.id] || []).includes(opt.id);
                  let optColor = '';
                  if (isDone) {
                    if (q.type === 'single') {
                      if (opt.id === q.correctAnswers[0] && checked) optColor = 'bg-green-200';
                      else if (checked && opt.id !== q.correctAnswers[0]) optColor = 'bg-red-200';
                    } else {
                      if (q.correctAnswers.includes(opt.id) && checked) optColor = 'bg-green-200';
                      else if (checked && !q.correctAnswers.includes(opt.id)) optColor = 'bg-orange-200';
                    }
                  }
                  return (
                    <label key={opt.id} className={`flex items-center ${showResult || completed ? 'px-0 ml-0 pl-0' : 'px-2'} py-1 rounded w-full break-words ${optColor} transition-all duration-300`}>
                      {(!showResult && !completed) ? (
                        <input
                          type={q.type === 'single' ? 'radio' : 'checkbox'}
                          name={`q_${q.id}`}
                          value={opt.id}
                          checked={checked}
                          disabled={isDone}
                          onChange={() => handleOptionChange(q.id, opt.id, q.type)}
                          className="mr-2"
                        />
                      ) : null}
                      <span className="break-words">
                        <TranslatedText text={opt.text} />
                      </span>
                    </label>
                  );
                })}
              </div>
              {isDone && status !== 'correct' && (
                <div className="mt-2 text-xs text-gray-700 break-words">
                  <span className="font-semibold">
                    <TranslatedText text="Правильна відповідь:" />{' '}
                  </span>
                  <TranslatedText text={q.options.filter(opt => q.correctAnswers.includes(opt.id)).map(opt => opt.text).join(', ')} />
                </div>
              )}
            </div>
          );
        })}
        {error && <div className="text-red-600 text-center mt-2">
          <TranslatedText text={error} />
        </div>}
      </div>
      {showResult ? (
        <div className="flex flex-col w-full gap-2 mt-2">
          <button className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition" onClick={() => onComplete(testResult || result)}>
            <TranslatedText text="Завершити урок" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col w-full gap-2 mt-2 [@media(min-width:370px)]:flex-row [@media(min-width:370px)]:justify-end [@media(min-width:370px)]:items-center [@media(min-width:370px)]:w-auto [@media(min-width:370px)]:gap-2">
          <button className="w-full [@media(min-width:370px)]:w-auto px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition" onClick={onExit}>
            <TranslatedText text="Вийти" />
          </button>
          {!isDone && <button className="w-full [@media(min-width:370px)]:w-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition" onClick={handleSubmit}>
            <TranslatedText text="Завершити тест" />
          </button>}
        </div>
      )}
    </div>
  );
};

export default LessonTestUI;