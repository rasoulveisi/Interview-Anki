import { useState } from 'react';
import { 
  FolderKanban, 
  Sparkles, 
  PlusCircle, 
  Search, 
  BarChart3, 
  Cloud, 
  CloudCheck, 
  CloudOff, 
  User, 
  Settings,
  Flame,
  Layers
} from 'lucide-react';
import { Deck, UserProfile } from '../types';

interface MobileHeaderProps {
  currentTab: string;
  selectedDeck: Deck | null;
  profile: UserProfile | null;
  syncStatus: 'synced' | 'syncing' | 'offline';
  streak: number;
  onOpenProfile: () => void;
  onOpenDeckSettings?: () => void;
  onSelectAllDecks: () => void;
}

export function MobileHeader({
  currentTab,
  selectedDeck,
  profile,
  syncStatus,
  streak,
  onOpenProfile,
  onOpenDeckSettings,
  onSelectAllDecks
}: MobileHeaderProps) {
  const getTitle = () => {
    if (selectedDeck && currentTab === 'study') {
      return selectedDeck.name;
    }
    switch (currentTab) {
      case 'decks':
        return 'AnkiDroid Web';
      case 'study':
        return selectedDeck ? selectedDeck.name : 'SRS Study Session';
      case 'add':
        return 'Create Flashcard';
      case 'browser':
        return 'Card Browser';
      case 'stats':
        return 'SRS Analytics';
      default:
        return 'AnkiDroid';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 px-4 py-3 select-none transition-all">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        
        {/* Left: Brand & Deck Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button 
            onClick={onSelectAllDecks}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/30 active:scale-95 transition-transform"
            title="All Decks"
          >
            <Layers className="w-5 h-5 text-indigo-400" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold text-slate-100 truncate tracking-tight">
                {getTitle()}
              </h1>
              {selectedDeck && currentTab === 'study' && (
                <span 
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: selectedDeck.color || '#6366F1' }}
                />
              )}
            </div>
            <p className="text-[11px] text-slate-400 truncate flex items-center gap-1.5 font-medium">
              <span>Spaced Repetition (SM-2)</span>
              <span>&bull;</span>
              <span className="text-emerald-400 font-semibold">Firebase Cloud Sync</span>
            </p>
          </div>
        </div>

        {/* Right: Streak & Cloud Status & Profile */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Daily Streak */}
          <div 
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-bold"
            title={`${streak} day study streak`}
          >
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-pulse" />
            <span>{streak}d</span>
          </div>

          {/* Sync Status Badge */}
          <button
            onClick={onOpenProfile}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border transition-colors ${
              syncStatus === 'synced'
                ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400'
                : syncStatus === 'syncing'
                ? 'bg-indigo-950/40 border-indigo-800/40 text-indigo-400 animate-pulse'
                : 'bg-rose-950/40 border-rose-800/40 text-rose-400'
            }`}
            title={`Firebase Status: ${syncStatus}`}
          >
            {syncStatus === 'synced' && <CloudCheck className="w-3.5 h-3.5" />}
            {syncStatus === 'syncing' && <Cloud className="w-3.5 h-3.5" />}
            {syncStatus === 'offline' && <CloudOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline capitalize text-[11px]">{syncStatus}</span>
          </button>

          {/* User Profile Button */}
          <button
            onClick={onOpenProfile}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors active:scale-95"
            title="User Profile & Sync Settings"
          >
            <User className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
