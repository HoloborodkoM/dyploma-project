import React, { useState, useEffect } from 'react';
import { Test, TestQuestion, TestOption, TestFormState } from './types';
import { t } from '@/components/TranslatedText';
import { v4 as uuidv4 } from 'uuid';

interface TestLogicProps {
  initialTest?: Test;
  onChange: (test: Test) => void;
  errors?: Record<string, string>;
  children: (props: {
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
    getSaveButtonStatus: () => boolean;
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
    validateAndSaveTest: () => void;
    showErrors: boolean;
  }) => React.ReactNode;
  onSaveTest: (test: Test) => void;
}

const createEmptyQuestion = (type: 'SINGLE' | 'MULTIPLE' = 'SINGLE'): TestQuestion => ({
  id: uuidv4(),
  question: '',
  type,
  options: type === 'MULTIPLE'
    ? [
        { id: uuidv4(), text: '', isCorrect: true },
        { id: uuidv4(), text: '', isCorrect: true }
      ]
    : [
        { id: uuidv4(), text: '', isCorrect: true },
        { id: uuidv4(), text: '', isCorrect: false }
      ]
});

const TestLogic: React.FC<TestLogicProps> = ({
  initialTest,
  onChange,
  errors = {},
  children,
  onSaveTest
}) => {
  const [state, setState] = useState<TestFormState>({
    questions: initialTest?.questions && initialTest.questions.length > 0
      ? initialTest.questions
      : [createEmptyQuestion()],
    activeQuestionIndex: 0,
    errors: {}
  });

  const [translations, setTranslations] = useState({
    questionPlaceholder: 'Введіть питання',
    optionPlaceholder: 'Варіант відповіді',
    addQuestionText: 'Додати питання',
    removeQuestionText: 'Видалити питання',
    addOptionText: 'Додати варіант відповіді',
    removeOptionText: 'Видалити варіант',
    singleChoiceText: 'Одна правильна відповідь',
    multipleChoiceText: 'Декілька правильних відповідей',
    questionTypeLabel: 'Тип питання',
    correctAnswerText: 'Правильна відповідь',
    moveUpText: 'Перемістити вгору',
    moveDownText: 'Перемістити вниз',
    noQuestionsText: 'Немає питань. Додайте перше питання нижче.',
    questionLabelText: 'Питання'
  });

  const [lang, setLang] = useState<'ua' | 'en'>('ua');
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    const currentLang = typeof window !== 'undefined' ? localStorage.getItem('preferredLanguage') : 'ua';
    setLang(currentLang === 'en' ? 'en' : 'ua');
  }, []);

  useEffect(() => {
    t('Введіть питання', lang).then(text => setTranslations(prev => ({ ...prev, questionPlaceholder: text })));
    t('Варіант відповіді', lang).then(text => setTranslations(prev => ({ ...prev, optionPlaceholder: text })));
    t('Додати питання', lang).then(text => setTranslations(prev => ({ ...prev, addQuestionText: text })));
    t('Видалити питання', lang).then(text => setTranslations(prev => ({ ...prev, removeQuestionText: text })));
    t('Додати варіант відповіді', lang).then(text => setTranslations(prev => ({ ...prev, addOptionText: text })));
    t('Видалити варіант', lang).then(text => setTranslations(prev => ({ ...prev, removeOptionText: text })));
    t('Одна правильна відповідь', lang).then(text => setTranslations(prev => ({ ...prev, singleChoiceText: text })));
    t('Декілька правильних відповідей', lang).then(text => setTranslations(prev => ({ ...prev, multipleChoiceText: text })));
    t('Тип питання', lang).then(text => setTranslations(prev => ({ ...prev, questionTypeLabel: text })));
    t('Правильна відповідь', lang).then(text => setTranslations(prev => ({ ...prev, correctAnswerText: text })));
    t('Перемістити вгору', lang).then(text => setTranslations(prev => ({ ...prev, moveUpText: text })));
    t('Перемістити вниз', lang).then(text => setTranslations(prev => ({ ...prev, moveDownText: text })));
    t('Немає питань. Додайте перше питання нижче.', lang).then(text => setTranslations(prev => ({ ...prev, noQuestionsText: text })));
    t('Питання', lang).then(text => setTranslations(prev => ({ ...prev, questionLabelText: text })));
  }, [lang]);

  const addQuestion = () => {
    setState(prev => {
      const type = prev.questions[0]?.type || 'SINGLE';
      const newQuestions = [...prev.questions, createEmptyQuestion(type)];
      const newState = {
        ...prev,
        questions: newQuestions,
        activeQuestionIndex: newQuestions.length - 1
      };
      onChange({ questions: newQuestions });
      return newState;
    });
  };

  const removeQuestion = (index: number) => {
    setState(prev => {
      const newQuestions = [...prev.questions];
      newQuestions.splice(index, 1);
      
      if (newQuestions.length === 0) {
        newQuestions.push(createEmptyQuestion());
      }
      
      const newState = {
        ...prev,
        questions: newQuestions,
        activeQuestionIndex: Math.min(prev.activeQuestionIndex, newQuestions.length - 1)
      };
      onChange({ questions: newQuestions });
      return newState;
    });
  };

  const validateAllQuestions = (questions: TestQuestion[]) => {
    const errors: Record<string, string> = {};
    questions.forEach((q, qIdx) => {
      if (!q.question.trim()) {
        errors[`question-${qIdx}`] = 'Назва питання не може бути порожньою';
      }
      if (q.options.some(opt => !opt.text.trim())) {
        errors[`option-${qIdx}`] = 'Усі варіанти повинні бути заповнені';
      }
    });
    return errors;
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    setState(prev => {
      const newQuestions = [...prev.questions];
      newQuestions[index] = {
        ...newQuestions[index],
        [field]: value
      };

      if (field === 'type' && value === 'MULTIPLE') {
        newQuestions[index].options = newQuestions[index].options.map((opt, i) => ({
          ...opt,
          isCorrect: i < 2
        }));
      }

      if (field === 'type' && value === 'SINGLE') {
        const correctIndex = newQuestions[index].options.findIndex(option => option.isCorrect);
        newQuestions[index].options = newQuestions[index].options.map((option, i) => ({
          ...option,
          isCorrect: i === (correctIndex !== -1 ? correctIndex : 0)
        }));
      }

      const errors = showErrors ? validateAllQuestions(newQuestions) : {};
      const newState = {
        ...prev,
        questions: newQuestions,
        errors
      };
      onChange({ questions: newQuestions });
      return newState;
    });
  };

  const updateOption = (questionIndex: number, optionIndex: number, field: string, value: any) => {
    setState(prev => {
      const newQuestions = [...prev.questions];
      const options = [...newQuestions[questionIndex].options];
      const qType = newQuestions[questionIndex].type;
      if (field === 'isCorrect' && qType === 'MULTIPLE' && value === false) {
        const checkedCount = options.filter(o => o.isCorrect).length;
        if (checkedCount <= 2 && options[optionIndex].isCorrect) {
          return prev;
        }
      }
      if (field === 'isCorrect' && value === true && qType === 'SINGLE') {
        options.forEach((option, index) => {
          if (index !== optionIndex) {
            options[index] = { ...option, isCorrect: false };
          }
        });
      }
      options[optionIndex] = {
        ...options[optionIndex],
        [field]: value
      };
      newQuestions[questionIndex] = {
        ...newQuestions[questionIndex],
        options
      };

      const errors = showErrors ? validateAllQuestions(newQuestions) : {};
      const newState = {
        ...prev,
        questions: newQuestions,
        errors
      };
      onChange({ questions: newQuestions });
      return newState;
    });
  };

  const setActiveQuestion = (index: number) => {
    setState(prev => {
      const errors = showErrors ? validateAllQuestions(prev.questions) : {};
      return {
        ...prev,
        activeQuestionIndex: index,
        errors
      };
    });
  };

  const validateAndSaveTest = () => {
    const errors = validateAllQuestions(state.questions);
    if (Object.keys(errors).length > 0) {
      setShowErrors(true);
      setState(prev => ({ ...prev, errors }));
      return;
    }
    setShowErrors(false);
    setState(prev => ({ ...prev, errors: {} }));
    if (typeof onSaveTest === 'function') onSaveTest({ questions: state.questions });
  };

  const addOption = (questionIndex: number) => {
    setState(prev => {
      const newQuestions = [...prev.questions];
      const newOption: TestOption = {
        id: uuidv4(),
        text: '',
        isCorrect: false
      };
      
      newQuestions[questionIndex] = {
        ...newQuestions[questionIndex],
        options: [...newQuestions[questionIndex].options, newOption]
      };
      
      const newState = {
        ...prev,
        questions: newQuestions
      };
      onChange({ questions: newQuestions });
      return newState;
    });
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    setState(prev => {
      const newQuestions = [...prev.questions];
      const options = [...newQuestions[questionIndex].options];
      
      if (options.length <= 2) {
        return prev;
      }
      
      const removingOption = options[optionIndex];
      options.splice(optionIndex, 1);
      
      if (removingOption.isCorrect && newQuestions[questionIndex].type === 'SINGLE') {
        options[0].isCorrect = true;
      }
      
      newQuestions[questionIndex] = {
        ...newQuestions[questionIndex],
        options
      };
      
      const newState = {
        ...prev,
        questions: newQuestions
      };
      onChange({ questions: newQuestions });
      return newState;
    });
  };

  const moveQuestionUp = (index: number) => {
    if (index === 0) return;
    
    setState(prev => {
      const newQuestions = [...prev.questions];
      const temp = newQuestions[index];
      newQuestions[index] = newQuestions[index - 1];
      newQuestions[index - 1] = temp;
      
      return {
        ...prev,
        questions: newQuestions,
        activeQuestionIndex: index - 1
      };
    });
  };

  const moveQuestionDown = (index: number) => {
    setState(prev => {
      if (index === prev.questions.length - 1) return prev;
      
      const newQuestions = [...prev.questions];
      const temp = newQuestions[index];
      newQuestions[index] = newQuestions[index + 1];
      newQuestions[index + 1] = temp;
      
      return {
        ...prev,
        questions: newQuestions,
        activeQuestionIndex: index + 1
      };
    });
  };

  const getSaveButtonStatus = () => {
    if (state.questions.length === 0) return false;
    
    for (const question of state.questions) {
      if (!question.question.trim()) return false;
      if (question.options.length < 2) return false;
      if (question.options.some(option => !option.text.trim())) return false;
      if (!question.options.some(option => option.isCorrect)) return false;
    }
    
    return true;
  };

  return children({
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
    getSaveButtonStatus,
    translations,
    errors: { ...state.errors, ...errors },
    validateAndSaveTest,
    showErrors
  });
};

export default TestLogic;