export interface TestQuestion {
  id: string;
  question: string;
  type: 'SINGLE' | 'MULTIPLE';
  options: TestOption[];
}

export interface TestOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Test {
  id?: string;
  questions: TestQuestion[];
}

export interface TestFormState {
  questions: TestQuestion[];
  activeQuestionIndex: number;
  errors: Record<string, string>;
}