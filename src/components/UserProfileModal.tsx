import React, { useState } from 'react';
import { 
  X, 
  CloudCheck, 
  Download, 
  Upload, 
  LogOut, 
  LogIn, 
  RefreshCw,
  Sliders,
  Sparkles,
  Check
} from 'lucide-react';
import { UserProfile } from '../types';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { PWAInstallButton } from './PWAInstallButton';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  syncStatus: 'synced' | 'syncing' | 'offline';
  totalCards: number;
  totalDecks: number;
  onExportData: () => void;
  onImportData: (file: File) => void;
  onForceSync: () => void;
  onUpdateProfile?: (updatedProfile: UserProfile) => void;
}

export function UserProfileModal({
  isOpen,
  onClose,
  profile,
  syncStatus,
  totalCards,
  totalDecks,
  onExportData,
  onImportData,
  onForceSync,
  onUpdateProfile
}: UserProfileModalProps) {
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Daily Limits State
  const [dailyNewLimit, setDailyNewLimit] = useState<number>(profile?.dailyNewLimit || 20);
  const [dailyReviewLimit, setDailyReviewLimit] = useState<number>(profile?.dailyReviewLimit || 100);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const currentUser = auth.currentUser;
  const isAnonymous = currentUser?.isAnonymous ?? true;

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setIsSigningIn(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      setAuthError(err?.message || 'Failed to sign in with Google');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onClose();
    } catch (err: any) {
      console.error('Sign Out Error:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportData(file);
      e.target.value = '';
    }
  };

  const handleSaveLimits = () => {
    if (!profile) return;
    const updated: UserProfile = {
      ...profile,
      dailyNewLimit,
      dailyReviewLimit,
      updatedAt: new Date().toISOString()
    };
    if (onUpdateProfile) {
      onUpdateProfile(updated);
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <CloudCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-none">
                Settings & Cloud Sync
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Daily limits and database storage
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Status Banner */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${syncStatus === 'synced' ? 'bg-emerald-400' : 'bg-indigo-400 animate-ping'}`} />
            <span className="text-slate-300 font-medium capitalize">
              Status: <b className="text-white">{syncStatus}</b>
            </span>
          </div>

          <button
            onClick={onForceSync}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold active:scale-95 transition-all"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Sync Now</span>
          </button>
        </div>

        {/* Daily Limitations & Study Goals */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Daily Study Limitations</span>
            </div>
            {isSaved && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                <Check className="w-3 h-3" /> Saved!
              </span>
            )}
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <div className="flex items-center justify-between text-slate-300 mb-1">
                <span>Daily New Cards Target</span>
                <span className="font-bold text-indigo-400">
                  {dailyNewLimit >= 999 ? 'Unlimited' : `${dailyNewLimit} cards/day`}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {[5, 10, 20, 50, 999].map(num => (
                  <button
                    key={num}
                    onClick={() => setDailyNewLimit(num)}
                    className={`py-1 rounded-lg font-bold text-[11px] border transition-all ${
                      dailyNewLimit === num
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {num === 999 ? 'No Limit' : num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-slate-300 mb-1">
                <span>Daily Review Cards Target</span>
                <span className="font-bold text-indigo-400">
                  {dailyReviewLimit >= 999 ? 'Unlimited' : `${dailyReviewLimit} cards/day`}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {[20, 50, 100, 200, 999].map(num => (
                  <button
                    key={num}
                    onClick={() => setDailyReviewLimit(num)}
                    className={`py-1 rounded-lg font-bold text-[11px] border transition-all ${
                      dailyReviewLimit === num
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {num === 999 ? 'No Limit' : num}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSaveLimits}
              className="w-full mt-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Save Study Limits</span>
            </button>
          </div>
        </div>

        {/* User Account Details */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Account Type</span>
            <span className="font-bold text-slate-200">
              {isAnonymous ? 'Anonymous Session' : currentUser?.email || 'Signed In'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">User ID</span>
            <span className="font-mono text-[11px] text-slate-400 truncate max-w-[180px]">
              {currentUser?.uid || 'local_user'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Total Flashcards</span>
            <span className="font-bold text-indigo-400">
              {totalDecks} Decks &bull; {totalCards} Cards
            </span>
          </div>
        </div>

        {/* Google Authentication */}
        {isAnonymous ? (
          <div className="space-y-2">
            <button
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md active:scale-95 transition-all"
            >
              <LogIn className="w-4 h-4 text-indigo-600" />
              <span>{isSigningIn ? 'Connecting...' : 'Sign In with Google to Keep Synced'}</span>
            </button>
            <p className="text-[11px] text-slate-400 text-center">
              Link your account to access your flashcards on any phone or desktop without losing progress.
            </p>
          </div>
        ) : (
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Sign Out</span>
          </button>
        )}

        {authError && (
          <p className="text-xs text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-800/40">
            {authError}
          </p>
        )}

        {/* PWA App Installation Option */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <PWAInstallButton variant="modal" />
        </div>

        {/* Data Backup & Export Section */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Offline Backup & Export
          </span>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onExportData}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export JSON</span>
            </button>

            <label className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold cursor-pointer active:scale-95 transition-all">
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>Import Backup</span>
              <input type="file" accept=".json,.csv" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        </div>

      </div>
    </div>
  );
}
