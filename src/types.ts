// Anki / Spaced Repetition (SRS) Types
export type CardState = 'new' | 'learning' | 'review' | 'relearning' | 'suspended';

export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

// Decoupled Content Template (Immutable Card Definition)
export interface CardTemplate {
  id: string;
  deckId: string;
  front: string;
  back: string;
  notes?: string;
  spokenTip?: string;
  tags: string[];
  difficulty?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Decoupled Deck Template (Immutable Deck Definition)
export interface DeckTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  color: string;
  iconName: string;
  isDefault?: boolean;
  totalCards: number;
}

// User SRS Progress (Personal / Mutable / Lightweight)
export interface CardProgress {
  cardId: string;
  deckId: string;
  userId?: string;
  state: CardState;
  due: number; // unix timestamp in ms
  interval: number; // in days
  easeFactor: number; // default 2.5
  repetitions: number;
  lapses: number;
  lastReviewedAt?: number;
  isFavorite?: boolean;
  updatedAt: string;
}

// Manifest Types for JSON Decks
export interface DeckManifestItem {
  id: string;
  category: string;
  name: string;
  description: string;
  color: string;
  iconName: string;
  cardCount: number;
  filename: string;
}

export interface DecksManifest {
  version: string;
  updatedAt: string;
  decks: DeckManifestItem[];
}

export interface Card {
  id: string;
  userId: string;
  deckId: string;
  front: string;
  back: string;
  notes?: string;
  spokenTip?: string;
  tags: string[];
  difficulty?: string;
  state: CardState;
  due: number; // unix timestamp in ms
  interval: number; // in days (0 for learning/sub-day)
  easeFactor: number; // default 2.5 (250%)
  repetitions: number; // successful consecutive reviews
  lapses: number; // failed review count
  lastReviewedAt?: number;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Deck {
  id: string;
  userId: string;
  name: string;
  description: string;
  category: string;
  color: string;
  iconName: string;
  totalCards: number;
  newCount: number;
  learnCount: number;
  reviewCount: number;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewLog {
  id: string;
  userId: string;
  cardId: string;
  deckId: string;
  rating: ReviewRating;
  timeSpentMs: number;
  previousInterval: number;
  newInterval: number;
  previousEase: number;
  newEase: number;
  reviewedAt: number;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  email?: string;
  isAnonymous?: boolean;
  dailyNewLimit: number;
  dailyReviewLimit: number;
  streak: number;
  lastStudyDate: string;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface NextIntervalEstimate {
  label: string; // e.g. "< 1m", "10m", "1d", "4d"
  days: number;
  dueTimestamp: number;
  nextState: CardState;
  nextEase: number;
  nextInterval: number;
  nextReps: number;
  nextLapses: number;
}

export interface DeckStats {
  newCount: number;
  learnCount: number;
  reviewCount: number;
  totalCount: number;
  masteredCount: number;
}

// Question / Category Types for preseeded knowledge base
export type CategoryId = 
  // Frontend Mastery Categories
  | 'javascript'
  | 'typescript'
  | 'angular'
  | 'rxjs'
  | 'statemanagement'
  | 'htmlcss'
  | 'browser'
  | 'performance'
  | 'architecture'
  | 'security'
  | 'testing'
  | 'patterns'
  | 'a11y'
  | 'tooling'
  | 'gitworkflow'
  | 'fesystemdesign'
  | 'fescenarios'
  | 'reactcore'
  | 'reactadvanced'
  // Full-Stack / Backend Categories
  | 'web' 
  | 'dotnet' 
  | 'efcore' 
  | 'sql' 
  | 'apidesign' 
  | 'microservices' 
  | 'systemdesign' 
  | 'scenarios';

export type DifficultyLevel = 'Basic' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Senior' | 'Strong Mid' | string;

export type AssessmentGrade = 'strong' | 'okay' | 'weak' | 'dont_know';

export interface SystemDesignSection {
  requirements?: any;
  architectureOverview?: string;
  frontendDesign?: string;
  backendServices?: string;
  databaseSchema?: string;
  cachingAndPerformance?: string;
  apiDesign?: any;
  messagingAndAsync?: string;
  authAndSecurity?: string;
  scalabilityAndReliability?: string;
  tradeOffs?: any;
  failureScenariosAndMitigations?: any;
  [key: string]: any;
}

export interface Question {
  id: string;
  title?: string;
  category: CategoryId;
  topic?: string;
  difficulty: DifficultyLevel;
  question: string;
  shortAnswer: string;
  detailedExplanation?: string;
  codeExample?: string;
  keyPointsToMention?: string[];
  whatInterviewersLookFor?: string[];
  followUpQuestions?: any[];
  followUps?: any[];
  spokenTip?: string;
  seniorPoint?: string;
  interviewAnswer?: string;
  example?: any;
  tags?: string[];
  systemDesignDetails?: SystemDesignSection;
  [key: string]: any;
}

export interface CategoryMeta {
  id: CategoryId;
  name: string;
  shortName?: string;
  description: string;
  iconName: string;
  color: string;
  accentBg?: string;
  borderColor?: string;
  questionCount?: number;
}

export interface UserQuestionProgress {
  questionId: string;
  status: 'not_started' | 'learning' | 'completed' | 'need_review' | 'difficult';
  assessmentGrade?: AssessmentGrade;
  lastReviewedDate?: string;
  lastStudiedAt?: string;
  reviewCount: number;
  notes?: string;
  isBookmarked?: boolean;
  isFavorite?: boolean;
}

export interface MockInterviewResultItem {
  questionId: string;
  category: CategoryId;
  questionText: string;
  grade: AssessmentGrade;
  timeSpentSeconds: number;
}
