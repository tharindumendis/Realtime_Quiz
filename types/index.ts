import { serverTimestamp } from 'firebase/database';

export interface AnswerOption {
  key: number;
  text: string;
}

export interface QuizQuestion {
  id?: string;
  question: string;
  answers: AnswerOption[];
  rightAnswer: number;
  timestamp: ReturnType<typeof serverTimestamp>;
}

export interface UserAnswer {
  userEmail: string;
  questionId: string;
  answerId: number;
  timestamp: ReturnType<typeof serverTimestamp>;
}


export interface UserScore {
  userEmail: string;
  score: number;
  lastAnswerTimestamp: number; 
}