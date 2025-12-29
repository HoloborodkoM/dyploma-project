import type { Test } from './test/types';

export interface Course {
  id?: string;
  title: string;
  description: string;
  keywords: string[];
  imageUrl?: string;
  sections?: Section[];
}

export interface Section {
  id?: string;
  title: string;
  lessons: Lesson[];
}

export interface Lesson {
  id?: string;
  title: string;
  type: 'TEXT' | 'VIDEO' | 'DOCUMENT' | 'TEST';
  content?: string;
  videoUrl?: string;
  documentUrl?: string;
  fileName?: string;
  fileUrl?: string;
  uploadError?: string;
  tempFileName?: string;
  testSaved?: boolean;
  test?: Test;
}

export interface Simulation {
  id?: string;
  title: string;
  description: string;
  keywords: string[];
  imageUrl?: string;
  steps: Step[];
}

export interface Step {
  id?: string;
  title: string;
  content: string;
  videoUrl: string;
  videoPreviewUrl?: string;
}

export interface FormState {
  title: string;
  description: string;
  keywords: string[];
  imageUrl: string;
  sections?: Section[];
  steps?: Step[];
  editingTitle: boolean;
  editingDescription: boolean;
  pendingImage: File | null;
  pendingFiles: { [key: string]: File };
  errors: Record<string, string>;
  imageLoading: boolean;
  fileLoading: { [key: string]: boolean };
  loading: boolean;
  showCancelModal: boolean;
}