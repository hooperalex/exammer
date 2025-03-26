export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  options?: string[];
  correctReasoning?: string;
  incorrectReasoning?: string;
}

export type Mode = 'learn' | 'test';
