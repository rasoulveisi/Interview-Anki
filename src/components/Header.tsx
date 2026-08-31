import React, { useState } from 'react';
import { 
  Search, 
  Flame, 
  CheckCircle2, 
  Menu, 
  Download, 
  Upload, 
  RotateCcw, 
  Sparkles,
  Settings,
  X,
  Layers,
  HelpCircle,
  TrendingUp,
  Bookmark
} from 'lucide-react';
import { CategoryId } from '../types';
import { exportProgressAsJson, importProgressFromJson, resetAllProgress } from '../utils/storage';

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  selectedCategory: CategoryId | 'all';
  setSelectedCategory: (cat: CategoryId | 'all') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  streakCount: number;
  completedCount: number;
  totalCount: number;
  onRefreshData: () => void;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  streakCount,
  completedCount,
  totalCount,
  onRefreshData,
  onToggleSidebar
}) => {
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleExport = () => {
    const json = exportProgressAsJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-prep-progress-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importProgressFromJson(content);
      if (success) {
        setImportError(null);
        setSettingsModalOpen(false);
        onRefreshData();
      } else {
        setImportError('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all your study progress? This cannot be undone.')) {
      resetAllProgress();
      setSettingsModalOpen(false);
      onRefreshData();
    }
  };

  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0 sticky top-0 z-20 shadow-xs">
        
        {/* Left Section: Mobile Menu Trigger & Progress Meter */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
            id="mobile-sidebar-toggle"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center gap-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Readiness Progress
            </span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-32 sm:w-40 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                <div 
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-xs font-bold text-slate-700 font-mono">
                {completedCount}/{totalCount} ({percentage}%)
              </span>
            </div>
          </div>
        </div>

        {/* Middle / Right: Search & Quick Actions */}
        <div className="flex items-center gap-3">
          
          {/* Quick Search */}
          <div className="relative w-40 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (currentView !== 'catalog') setCurrentView('catalog');
              }}
              placeholder="Search concepts..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              id="topbar-search-input"
            />
          </div>

          {/* Daily Streak Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200/80 rounded-md text-amber-800 text-xs font-bold shadow-xs">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{streakCount} Day Streak</span>
          </div>

          {/* Quick Action Button */}
          <button
            onClick={() => setCurrentView('interview')}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm transition-colors"
            id="topbar-mock-simulator-btn"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Mock Simulator
          </button>

          {/* Settings / Backup modal trigger */}
          <button
            onClick={() => setSettingsModalOpen(true)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
            title="Backup & Progress Settings"
            id="topbar-settings-btn"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Settings / Backup Modal */}
      {settingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6 text-slate-800">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-600" />
                Data & Progress Management
              </h2>
              <button 
                onClick={() => setSettingsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Your study answers, flashcard results, and custom notes are stored locally in your browser. You can export a JSON backup or transfer your progress to another device.
              </p>

              {importError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                  {importError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleExport}
                  className="flex items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors"
                >
                  <Download className="w-4 h-4 text-indigo-600" />
                  Export Backup
                </button>

                <label className="flex items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  Import Backup
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={handleReset}
                  className="w-full flex items-center justify-center gap-2 p-2.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-xs font-bold text-red-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4 text-red-600" />
                  Reset All Study Progress
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
