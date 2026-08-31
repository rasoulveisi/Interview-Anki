import { AssessmentGrade, CategoryId, UserQuestionProgress } from '../types';
import { allQuestions } from '../data';

const STORAGE_KEY = 'fullstack_interview_prep_progress_v1';
const STREAK_KEY = 'fullstack_interview_prep_streak_v1';

export interface StorageData {
  progress: Record<string, UserQuestionProgress>;
  streak: {
    currentStreak: number;
    lastActiveDate: string;
    totalDaysStudied: number;
  };
  customNotes: Record<string, string>;
}

export function loadStoredData(): StorageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return getInitialStorageData();
    }
    const parsed = JSON.parse(raw);
    return {
      progress: parsed.progress || {},
      streak: parsed.streak || { currentStreak: 1, lastActiveDate: new Date().toISOString().split('T')[0], totalDaysStudied: 1 },
      customNotes: parsed.customNotes || {}
    };
  } catch (err) {
    console.error('Error loading progress from localStorage:', err);
    return getInitialStorageData();
  }
}

function getInitialStorageData(): StorageData {
  const today = new Date().toISOString().split('T')[0];
  return {
    progress: {},
    streak: {
      currentStreak: 1,
      lastActiveDate: today,
      totalDaysStudied: 1
    },
    customNotes: {}
  };
}

export function saveStoredData(data: StorageData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving progress to localStorage:', err);
  }
}

export function updateQuestionProgress(
  questionId: string, 
  updates: Partial<UserQuestionProgress>
): StorageData {
  const data = loadStoredData();
  const existing = data.progress[questionId] || {
    questionId,
    status: 'not_started',
    isFavorite: false,
    reviewCount: 0
  };

  const now = new Date().toISOString();
  const updatedItem: UserQuestionProgress = {
    ...existing,
    ...updates,
    lastStudiedAt: now,
    reviewCount: (existing.reviewCount || 0) + (updates.status || updates.assessmentGrade ? 1 : 0)
  };

  data.progress[questionId] = updatedItem;
  updateStreakData(data);
  saveStoredData(data);
  return data;
}

export function toggleFavorite(questionId: string): boolean {
  const data = loadStoredData();
  const existing = data.progress[questionId] || {
    questionId,
    status: 'not_started',
    isFavorite: false,
    reviewCount: 0
  };
  const newState = !existing.isFavorite;
  data.progress[questionId] = {
    ...existing,
    isFavorite: newState
  };
  saveStoredData(data);
  return newState;
}

export function saveUserNote(questionId: string, note: string): void {
  const data = loadStoredData();
  data.customNotes[questionId] = note;
  saveStoredData(data);
}

function updateStreakData(data: StorageData): void {
  const today = new Date().toISOString().split('T')[0];
  const lastActive = data.streak.lastActiveDate;

  if (lastActive === today) {
    return; // Already active today
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (lastActive === yesterdayStr) {
    data.streak.currentStreak += 1;
  } else {
    data.streak.currentStreak = 1;
  }

  data.streak.lastActiveDate = today;
  data.streak.totalDaysStudied += 1;
}

export function resetAllProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportProgressAsJson(): string {
  const data = loadStoredData();
  return JSON.stringify(data, null, 2);
}

export function importProgressFromJson(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed && typeof parsed === 'object') {
      saveStoredData(parsed);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
