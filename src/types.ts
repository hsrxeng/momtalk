export type CategoryId = 'travel' | 'cafe' | 'greetings' | 'shopping' | 'emergency';

export interface KeyWord {
  word: string;
  meaning: string;
  phonetic?: string;
}

export interface Sentence {
  id: string;
  categoryId: CategoryId;
  english: string;
  koreanPronunciation: string;
  koreanMeaning: string;
  situationTip: string;
  keyWords: KeyWord[];
}

export interface Category {
  id: CategoryId;
  title: string;
  shortTitle: string;
  icon: string;
  color: string;
  badgeBg: string;
  accentColor: string;
  description: string;
}

export type ViewMode = 'card' | 'list' | 'quiz' | 'favorites';

export type FontSizeOption = 'large' | 'extra-large';

export interface AppSettings {
  fontSize: FontSizeOption;
  speechRate: number; // 0.65, 0.8, 1.0
  repeatCount: number; // 1, 3
}

export interface QuizItem {
  id: string;
  sentenceId: string;
  question: string;
  hint: string;
  audioText?: string;
  koreanMeaning: string;
  options: {
    english: string;
    koreanPronunciation: string;
    isCorrect: boolean;
  }[];
  explanation: string;
}
