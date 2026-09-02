import React, { useState } from 'react';
import { usePWAInstall } from '../utils/usePWAInstall';
import { Download, Smartphone, Share2, PlusSquare, X, Check } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'header' | 'modal' | 'banner';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  variant = 'header',
  className = '' 
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      await install();
    } finally {
      setIsInstalling(false);
    }
  };

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'modal') {
      return (
        <button
          onClick={handleInstallClick}
          disabled={isInstalling}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg active:scale-95 transition-all ${className}`}
        >
          <Download className="w-4 h-4" />
          <span>{isInstalling ? 'Installing...' : 'Install AnkiDroid to Device'}</span>
        </button>
      );
    }

    if (variant === 'banner') {
      return (
        <div className={`bg-gradient-to-r from-indigo-950/90 to-purple-950/90 border border-indigo-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl ${className}`}>
          <div className="flex items-center gap-3 text-left w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white leading-tight">
                Install AnkiDroid App
              </h4>
              <p className="text-xs text-slate-300">
                Practice cards offline anytime with lightning-fast native performance.
              </p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            disabled={isInstalling}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md active:scale-95 transition-all shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>{isInstalling ? 'Installing...' : 'Install PWA'}</span>
          </button>
        </div>
      );
    }

    // Default 'header' compact variant
    return (
      <button
        onClick={handleInstallClick}
        disabled={isInstalling}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm active:scale-95 transition-all ${className}`}
        title="Install AnkiDroid PWA on your device"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        {variant === 'modal' ? (
          <button
            onClick={() => setShowIOSGuide(true)}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs active:scale-95 transition-all ${className}`}
          >
            <Smartphone className="w-4 h-4 text-indigo-400" />
            <span>Install on iPhone / iPad</span>
          </button>
        ) : variant === 'banner' ? (
          <div className={`bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 ${className}`}>
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Add AnkiDroid to iOS Home Screen</h4>
                <p className="text-xs text-slate-400">Launch fullscreen with offline support.</p>
              </div>
            </div>
            <button
              onClick={() => setShowIOSGuide(true)}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all"
            >
              How to Install
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowIOSGuide(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium active:scale-95 transition-all ${className}`}
            title="Install on iOS"
          >
            <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Install iOS</span>
          </button>
        )}

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-white">Install on iOS</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <p>
                    Tap the <strong className="text-white">Share</strong> icon (<Share2 className="w-3.5 h-3.5 inline text-indigo-400 mx-0.5" />) in Safari's bottom toolbar.
                  </p>
                </div>

                <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <p>
                    Scroll down and select <strong className="text-white">Add to Home Screen</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-indigo-400 mx-0.5" />).
                  </p>
                </div>

                <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <p>
                    Tap <strong className="text-white">Add</strong> in top-right. AnkiDroid will appear on your Home Screen as an offline-capable standalone app!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-bold text-white shadow-md active:scale-95 transition-all"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
