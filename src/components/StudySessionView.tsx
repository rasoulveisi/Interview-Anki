import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Star, 
  Edit3, 
  Code, 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  RotateCcw,
  Sparkles,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { Card, Deck, ReviewRating } from '../types';
import { calculateNextReview, getCardBadgeColor } from '../utils/srs';
import { speakText, stopSpeaking } from '../utils/speech';

interface StudySessionViewProps {
  deck: Deck | null;
  cards: Card[];
  allDecks?: Deck[];
  onSelectDeck?: (deck: Deck) => void;
  onReviewCard: (card: Card, rating: ReviewRating, timeSpentMs: number) => void;
  onEditCard: (card: Card) => void;
  onToggleFavorite: (card: Card) => void;
  onBackToDecks: () => void;
  onResetDeckSRS?: (deckId: string) => void;
}

export function StudySessionView({
  deck,
  cards,
  allDecks = [],
  onSelectDeck,
  onReviewCard,
  onEditCard,
  onToggleFavorite,
  onBackToDecks,
  onResetDeckSRS
}: StudySessionViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [cardStartTime, setCardStartTime] = useState<number>(Date.now());
  const [sessionReviewCount, setSessionReviewCount] = useState(0);
  const [shuffledOrder, setShuffledOrder] = useState<string[] | null>(null);

  // All cards for the current deck (or all cards if All Decks selected) - Never limited or filtered out
  const rawDeckCards = useMemo(() => {
    return deck ? cards.filter(c => c.deckId === deck.id) : [...cards];
  }, [deck, cards]);

  // Handle optional shuffle ordering
  const activeCards = useMemo(() => {
    if (!shuffledOrder) return rawDeckCards;
    const cardMap = new Map<string, Card>(rawDeckCards.map(c => [c.id, c]));
    const ordered: Card[] = [];
    shuffledOrder.forEach(id => {
      const c = cardMap.get(id);
      if (c) ordered.push(c);
    });
    // Add any newly added cards that weren't in shuffle list
    rawDeckCards.forEach(c => {
      if (!shuffledOrder.includes(c.id)) ordered.push(c);
    });
    return ordered;
  }, [rawDeckCards, shuffledOrder]);

  // Reset index when switching decks
  useEffect(() => {
    setCurrentIndex(0);
    setShuffledOrder(null);
    setIsFlipped(false);
    setShowNotes(false);
    setCardStartTime(Date.now());
  }, [deck?.id]);

  const currentCard = activeCards[currentIndex] || activeCards[0] || null;

  useEffect(() => {
    setIsFlipped(false);
    setShowNotes(false);
    setCardStartTime(Date.now());
    stopSpeaking();
    setIsSpeaking(false);
  }, [currentIndex, currentCard?.id]);

  // Next intervals preview for SM-2 buttons
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

  const handleNext = useCallback(() => {
    if (activeCards.length === 0) return;
    setCurrentIndex(prev => (prev + 1) % activeCards.length);
  }, [activeCards.length]);

  const handlePrev = useCallback(() => {
    if (activeCards.length === 0) return;
    setCurrentIndex(prev => (prev - 1 + activeCards.length) % activeCards.length);
  }, [activeCards.length]);

  const handleRate = useCallback((rating: ReviewRating) => {
    if (!currentCard || activeCards.length === 0) return;

    const timeSpent = Math.max(500, Date.now() - cardStartTime);
    
    // Save review rating and update SRS state
    onReviewCard(currentCard, rating, timeSpent);
    setSessionReviewCount(prev => prev + 1);

    // Smoothly advance to next card (continuous loop)
    handleNext();
  }, [currentCard, activeCards.length, cardStartTime, onReviewCard, handleNext]);

  const handleShuffle = () => {
    const ids = rawDeckCards.map(c => c.id);
    const shuffled = [...ids].sort(() => Math.random() - 0.5);
    setShuffledOrder(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleResetProgress = () => {
    if (deck && onResetDeckSRS) {
      if (confirm(`Reset SRS progress for "${deck.name}"? All cards will be marked as new.`)) {
        onResetDeckSRS(deck.id);
        setCurrentIndex(0);
      }
    }
  };

  // Keyboard Shortcuts (Space = Flip, Left/Right = Prev/Next, 1=Again, 2=Hard, 3=Good, 4=Easy)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (isFlipped) {
        if (e.key === '1') handleRate('again');
        if (e.key === '2') handleRate('hard');
        if (e.key === '3') handleRate('good');
        if (e.key === '4') handleRate('easy');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, handleFlip, handleRate, handleNext, handlePrev]);

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      speakText(text);
      setIsSpeaking(true);
    }
  };

  // Empty custom deck safety state
  if (!currentCard || activeCards.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center space-y-4">
        <Layers className="w-12 h-12 text-slate-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">No cards in this deck</h2>
        <p className="text-xs text-slate-400">
          This deck does not have any cards yet.
        </p>
        <button
          onClick={onBackToDecks}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all"
        >
          Back to Decks
        </button>
      </div>
    );
  }

  const badge = getCardBadgeColor(currentCard.state);

  return (
    <div className="max-w-xl mx-auto px-3 sm:px-4 py-3 pb-28 space-y-3">
      
      {/* Top Deck Status & Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-800/60 border border-slate-700/60 rounded-xl px-3 py-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToDecks}
            className="flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="truncate max-w-[120px] sm:max-w-[180px] font-bold">
              {deck ? deck.name : 'All Decks'}
            </span>
          </button>

          {/* Quick Deck Switcher Dropdown if allDecks provided */}
          {allDecks && allDecks.length > 0 && onSelectDeck && (
            <select
              value={deck?.id || ''}
              onChange={(e) => {
                const targetDeck = allDecks.find(d => d.id === e.target.value);
                if (targetDeck) onSelectDeck(targetDeck);
              }}
              className="bg-slate-900 border border-slate-700 text-slate-300 text-[11px] rounded-lg px-2 py-0.5 focus:outline-none focus:border-indigo-500 max-w-[130px] truncate"
            >
              {allDecks.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Card Counter & Shuffle/Reset Actions */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-mono font-bold text-indigo-300 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
            {currentIndex + 1} / {activeCards.length}
          </span>

          <button
            onClick={handleShuffle}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
            title="Shuffle cards order"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>

          {deck && onResetDeckSRS && (
            <button
              onClick={handleResetProgress}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
              title="Reset deck progress to new"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

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
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
            title="Edit card"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Flashcard Container */}
      <div 
        onClick={!isFlipped ? handleFlip : undefined}
        className={`bg-slate-800/90 border border-slate-700 rounded-2xl p-5 sm:p-6 shadow-2xl transition-all duration-200 min-h-[340px] flex flex-col justify-between ${
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
              {currentCard.tags && currentCard.tags.length > 0 && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-900/60 text-slate-400 border border-slate-700/50">
                  {currentCard.tags[0]}
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
              Question ({currentIndex + 1}/{activeCards.length})
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

      {/* Prev / Next Navigation Arrows */}
      <div className="flex items-center justify-between gap-2 px-1">
        <button
          onClick={handlePrev}
          className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        <span className="text-[11px] text-slate-500 font-mono">
          Reviews this session: <b className="text-slate-300">{sessionReviewCount}</b>
        </span>

        <button
          onClick={handleNext}
          className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Rating Bar (Anki SM-2 4 Buttons: Again, Hard, Good, Easy) */}
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
