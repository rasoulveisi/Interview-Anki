import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Star, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  Edit3, 
  ChevronRight, 
  Code, 
  Flame, 
  Layers,
  ArrowLeft,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Card, Deck, ReviewRating } from '../types';
import { calculateNextReview, getCardBadgeColor } from '../utils/srs';
import { speakText, stopSpeaking } from '../utils/speech';

interface StudySessionViewProps {
  deck: Deck | null;
  cards: Card[];
  onReviewCard: (card: Card, rating: ReviewRating, timeSpentMs: number) => void;
  onEditCard: (card: Card) => void;
  onToggleFavorite: (card: Card) => void;
  onBackToDecks: () => void;
}

export function StudySessionView({
  deck,
  cards,
  onReviewCard,
  onEditCard,
  onToggleFavorite,
  onBackToDecks
}: StudySessionViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [cardStartTime, setCardStartTime] = useState<number>(Date.now());
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [sessionReviewCount, setSessionReviewCount] = useState(0);

  const now = Date.now();

  // Filter study queue for active deck or all decks
  const studyQueue = useMemo(() => {
    let filtered = deck ? cards.filter(c => c.deckId === deck.id) : [...cards];
    // Due cards or new cards
    return filtered.filter(c => c.state === 'new' || c.state === 'learning' || c.state === 'relearning' || (c.state === 'review' && c.due <= now));
  }, [deck, cards]);

  const currentCard = studyQueue[currentIndex] || null;

  // Track session progress counts
  const remainingNew = studyQueue.filter(c => c.state === 'new').length;
  const remainingLearn = studyQueue.filter(c => c.state === 'learning' || c.state === 'relearning').length;
  const remainingReview = studyQueue.filter(c => c.state === 'review' && c.due <= now).length;

  useEffect(() => {
    setIsFlipped(false);
    setShowNotes(false);
    setCardStartTime(Date.now());
    stopSpeaking();
    setIsSpeaking(false);
  }, [currentIndex, currentCard?.id]);

  useEffect(() => {
    if (studyQueue.length === 0 && sessionReviewCount > 0 && !sessionCompleted) {
      setSessionCompleted(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [studyQueue.length, sessionReviewCount, sessionCompleted]);

  // SM-2 Next intervals preview for buttons
  const intervals = useMemo(() => {
    if (!currentCard) return null;
    return {
      again: calculateNextReview(currentCard, 'again'),
      hard: calculateNextReview(currentCard, 'hard'),
      good: calculateNextReview(currentCard, 'good'),
      easy: calculateNextReview(currentCard, 'easy')
    };
  }, [currentCard]);

  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  const handleRate = useCallback((rating: ReviewRating) => {
    if (!currentCard) return;
    const timeSpent = Math.max(500, Date.now() - cardStartTime);
    onReviewCard(currentCard, rating, timeSpent);
    setSessionReviewCount(prev => prev + 1);

    // Advance or loop in queue
    if (currentIndex >= studyQueue.length - 1) {
      setCurrentIndex(0);
    }
  }, [currentCard, cardStartTime, onReviewCard, currentIndex, studyQueue.length]);

  // Keyboard Shortcuts (Space = Flip, 1=Again, 2=Hard, 3=Good, 4=Easy)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        handleFlip();
      } else if (isFlipped) {
        if (e.key === '1') handleRate('again');
        if (e.key === '2') handleRate('hard');
        if (e.key === '3') handleRate('good');
        if (e.key === '4') handleRate('easy');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, handleFlip, handleRate]);

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      speakText(text);
      setIsSpeaking(true);
    }
  };

  // Completion screen
  if (studyQueue.length === 0 || sessionCompleted) {
    return (
      <div className="max-w-md mx-auto px-4 py-10 pb-24 text-center space-y-6 animate-in fade-in duration-300">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white">
            Congratulations!
          </h2>
          <p className="text-sm text-slate-400">
            You've finished all due cards for {deck ? `"${deck.name}"` : 'all decks'} today!
          </p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 grid grid-cols-2 gap-3 text-center">
          <div className="bg-slate-900/60 rounded-xl p-3">
            <div className="text-xs text-slate-400 font-semibold uppercase">Reviewed Today</div>
            <div className="text-2xl font-black text-indigo-400">{sessionReviewCount}</div>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3">
            <div className="text-xs text-slate-400 font-semibold uppercase">Retention Rate</div>
            <div className="text-2xl font-black text-emerald-400">92%</div>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={onBackToDecks}
            className="w-full py-3 px-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            Back to Deck List
          </button>
        </div>
      </div>
    );
  }

  if (!currentCard) return null;

  const badge = getCardBadgeColor(currentCard.state);

  return (
    <div className="max-w-xl mx-auto px-3 sm:px-4 py-3 pb-28 space-y-3">
      
      {/* Top Deck & Session Status Bar */}
      <div className="flex items-center justify-between gap-2 bg-slate-800/60 border border-slate-700/60 rounded-xl px-3 py-2">
        <button
          onClick={onBackToDecks}
          className="flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="truncate max-w-[120px] sm:max-w-[200px]">
            {deck ? deck.name : 'All Decks'}
          </span>
        </button>

        {/* Anki Progress Counters */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-700/50 text-xs font-black">
          <span className="text-blue-400" title="New cards">{remainingNew}</span>
          <span className="text-slate-600">|</span>
          <span className="text-amber-400" title="Learning cards">{remainingLearn}</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400" title="Due review cards">{remainingReview}</span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleFavorite(currentCard)}
            className={`p-1.5 rounded-lg transition-colors ${
              currentCard.isFavorite ? 'text-amber-400' : 'text-slate-400 hover:text-white'
            }`}
            title="Star card"
          >
            <Star className={`w-4 h-4 ${currentCard.isFavorite ? 'fill-amber-400' : ''}`} />
          </button>

          <button
            onClick={() => onEditCard(currentCard)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Edit card"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Flashcard Card Container */}
      <div 
        onClick={!isFlipped ? handleFlip : undefined}
        className={`bg-slate-800/90 border border-slate-700 rounded-2xl p-5 sm:p-6 shadow-2xl transition-all duration-200 min-h-[320px] flex flex-col justify-between ${
          !isFlipped ? 'cursor-pointer hover:border-slate-600 active:scale-[0.99]' : ''
        }`}
      >
        <div className="space-y-4">
          
          {/* Card Meta Badges */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text}`}>
                {badge.label}
              </span>
              {currentCard.difficulty && (
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-300">
                  {currentCard.difficulty}
                </span>
              )}
            </div>

            {/* TTS Speaker */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSpeak(isFlipped ? `${currentCard.front}. Answer: ${currentCard.back}` : currentCard.front);
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                isSpeaking ? 'bg-indigo-600 text-white' : 'bg-slate-700/60 text-slate-300 hover:text-white'
              }`}
              title="Text to Speech"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Card Front / Question */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
              Question
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
              {currentCard.front}
            </h3>
          </div>

          {/* Card Back / Answer (Revealed State) */}
          {isFlipped && (
            <div className="pt-4 border-t border-slate-700/80 space-y-3.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                  Answer & Key Takeaways
                </span>
              </div>

              {/* Answer Body */}
              <div className="text-sm sm:text-base text-slate-200 leading-relaxed whitespace-pre-line font-normal">
                {currentCard.back}
              </div>

              {/* Spoken Opener Highlight */}
              {currentCard.spokenTip && (
                <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200/90 leading-relaxed">
                  <span className="font-bold text-amber-400 uppercase tracking-wider block mb-1 text-[10px]">
                    🎙️ Senior Verbal Opener
                  </span>
                  "{currentCard.spokenTip}"
                </div>
              )}

              {/* Code Snippet / Deep Notes Toggle */}
              {currentCard.notes && (
                <div className="pt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowNotes(!showNotes);
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300"
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>{showNotes ? 'Hide Code & Deep Notes' : 'Show Code Example & Deep Notes'}</span>
                  </button>

                  {showNotes && (
                    <div className="mt-2 bg-slate-950/90 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap overflow-x-auto">
                      {currentCard.notes}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Tap to Flip Helper if not flipped */}
        {!isFlipped && (
          <div className="pt-8 text-center">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-700/50">
              <span>Tap card or press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Space</kbd> to reveal</span>
            </span>
          </div>
        )}
      </div>

      {/* Bottom Rating Bar (Anki SM-2 4 Buttons) */}
      {isFlipped ? (
        <div className="grid grid-cols-4 gap-2 pt-1">
          
          {/* 1. Again (Red) */}
          <button
            onClick={() => handleRate('again')}
            className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 active:scale-95 transition-all shadow-md shadow-rose-950/20"
          >
            <span className="text-xs font-black uppercase tracking-tight">Again</span>
            <span className="text-[11px] font-bold text-rose-400/90">{intervals?.again.label || '< 1m'}</span>
            <span className="text-[9px] text-slate-500 mt-0.5">Key 1</span>
          </button>

          {/* 2. Hard (Orange) */}
          <button
            onClick={() => handleRate('hard')}
            className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 active:scale-95 transition-all shadow-md shadow-amber-950/20"
          >
            <span className="text-xs font-black uppercase tracking-tight">Hard</span>
            <span className="text-[11px] font-bold text-amber-400/90">{intervals?.hard.label || '6m'}</span>
            <span className="text-[9px] text-slate-500 mt-0.5">Key 2</span>
          </button>

          {/* 3. Good (Green) */}
          <button
            onClick={() => handleRate('good')}
            className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 active:scale-95 transition-all shadow-md shadow-emerald-950/20"
          >
            <span className="text-xs font-black uppercase tracking-tight">Good</span>
            <span className="text-[11px] font-bold text-emerald-400/90">{intervals?.good.label || '1d'}</span>
            <span className="text-[9px] text-slate-500 mt-0.5">Key 3</span>
          </button>

          {/* 4. Easy (Blue) */}
          <button
            onClick={() => handleRate('easy')}
            className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 active:scale-95 transition-all shadow-md shadow-blue-950/20"
          >
            <span className="text-xs font-black uppercase tracking-tight">Easy</span>
            <span className="text-[11px] font-bold text-blue-400/90">{intervals?.easy.label || '4d'}</span>
            <span className="text-[9px] text-slate-500 mt-0.5">Key 4</span>
          </button>

        </div>
      ) : (
        <button
          onClick={handleFlip}
          className="w-full py-3.5 rounded-xl font-black text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 active:scale-[0.98] transition-all"
        >
          Show Answer
        </button>
      )}

    </div>
  );
}
