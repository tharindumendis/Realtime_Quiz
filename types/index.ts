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

// 🚨 UPDATED: Replaced userEmail with userId (the Firebase UID)
export interface UserAnswer {
  // We keep userName for display purposes, but the key is the UID
  userName: string; 
  questionId: string;
  answerId: number;
  timestamp: ReturnType<typeof serverTimestamp>;
}


// 🚨 UPDATED: Replaced userEmail with userId (the Firebase UID)
export interface UserScore {
  userId: string; // Changed from userEmail to userId
  score: number;
  lastAnswerTimestamp: number; 
}