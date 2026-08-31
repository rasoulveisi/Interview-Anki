import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Volume2, 
  Star,
  Shuffle
} from 'lucide-react';
import { CategoryId, Question } from '../types';
import { allQuestions, categoriesMeta } from '../data';
import { StorageData, toggleFavorite, updateQuestionProgress } from '../utils/storage';

interface FlashcardModeProps {
  storageData: StorageData;
  initialCategory?: CategoryId;
  onExit: () => void;
  onUpdateStorage: () => void;
}

export const FlashcardMode: React.FC<FlashcardModeProps> = ({
  storageData,
  initialCategory,
  onExit,
  onUpdateStorage
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>(initialCategory || 'all');
  const [onlyWeak, setOnlyWeak] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Deck generation
  const deck = React.useMemo(() => {
    let pool = allQuestions;
    if (selectedCategory !== 'all') {
      pool = pool.filter(q => q.category === selectedCategory);
    }
    if (onlyWeak) {
      pool = pool.filter(q => {
        const p = storageData.progress[q.id];
        return p && (p.status === 'difficult' || p.assessmentGrade === 'weak' || p.assessmentGrade === 'dont_know');
      });
    }
    return pool;
  }, [selectedCategory, onlyWeak, storageData]);

  const currentQuestion = deck[currentIndex];

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [selectedCategory, onlyWeak]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, deck.length]);

  const handleNext = () => {
    if (currentIndex < deck.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleGrade = (grade: 'weak' | 'strong') => {
    if (!currentQuestion) return;
    const status = grade === 'strong' ? 'completed' : 'difficult';
    updateQuestionProgress(currentQuestion.id, {
      status,
      assessmentGrade: grade
    });
    onUpdateStorage();
    handleNext();
  };

  const handleToggleFav = () => {
    if (!currentQuestion) return;
    toggleFavorite(currentQuestion.id);
    onUpdateStorage();
  };

  const isFav = currentQuestion ? storageData.progress[currentQuestion.id]?.isFavorite : false;
  const categoryMeta = currentQuestion ? categoriesMeta[currentQuestion.category] : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 space-y-6">
      
      {/* Top Bar Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <button
          onClick={onExit}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Topics</option>
            {Object.keys(categoriesMeta).map((k) => (
              <option key={k} value={k}>{categoriesMeta[k as CategoryId].name}</option>
            ))}
          </select>

          <button
            onClick={() => setOnlyWeak(!onlyWeak)}
            className={`px-3 py-1.5 rounded-md text-xs font-bold border transition-colors ${
              onlyWeak 
                ? 'bg-amber-50 border-amber-300 text-amber-800' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {onlyWeak ? 'Weak Only (Active)' : 'Weak Only'}
          </button>
        </div>
      </div>

      {deck.length > 0 && currentQuestion ? (
        <div className="space-y-6">
          
          {/* Deck Counter */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Card {currentIndex + 1} of {deck.length}</span>
            <span>Space: Flip &bull; &larr; / &rarr;: Navigate</span>
          </div>

          {/* Flashcard Box */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className={`min-h-[360px] bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-8 cursor-pointer shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group select-none`}
            id="flashcard-main-container"
          >
            {/* Top Card Meta */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase rounded border border-indigo-100">
                  {categoryMeta?.name}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {currentQuestion.topic}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFav();
                  }}
                  className={`p-1.5 rounded-md border ${
                    isFav 
                      ? 'bg-amber-50 border-amber-300 text-amber-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                </button>
                <span className="text-[10px] font-bold uppercase text-indigo-600 flex items-center gap-1">
                  <RotateCw className="w-3.5 h-3.5" /> {isFlipped ? 'Answer' : 'Question'}
                </span>
              </div>
            </div>

            {/* Front vs Back Content */}
            {!isFlipped ? (
              <div className="my-auto text-center space-y-4 py-8">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                  {currentQuestion.question}
                </h2>
                <p className="text-xs text-slate-400">
                  Click card or press Space to reveal solution & elevator pitch
                </p>
              </div>
            ) : (
              <div className="my-auto space-y-4 py-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Core Solution
                  </span>
                  <p className="text-sm font-medium text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200/80">
                    {currentQuestion.shortAnswer}
                  </p>
                </div>

                {currentQuestion.seniorPoint && (
                  <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-lg text-xs text-indigo-950">
                    <strong className="text-indigo-700">Senior Nuance: </strong>
                    {currentQuestion.seniorPoint}
                  </div>
                )}
              </div>
            )}

            {/* Bottom Controls inside card */}
            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-3">
              <span>{currentQuestion.difficulty}</span>
              <span className="text-indigo-600 font-semibold group-hover:translate-x-1 transition-transform">
                {isFlipped ? 'Click to flip back' : 'Click to flip answer &rarr;'}
              </span>
            </div>

          </div>

          {/* Bottom Card Navigation & Quick Grading */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === deck.length - 1}
                className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 shadow-xs"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleGrade('weak')}
                className="px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold shadow-xs transition-colors"
              >
                Still Weak
              </button>
              <button
                onClick={() => handleGrade('strong')}
                className="px-4 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold shadow-xs transition-colors"
              >
                Mastered ✓
              </button>
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3 shadow-sm">
          <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No flashcards in this filter</h3>
          <p className="text-xs text-slate-500">Try turning off "Weak Only" or choosing another category.</p>
          <button
            onClick={() => {
              setOnlyWeak(false);
              setSelectedCategory('all');
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
          >
            Reset Flashcard Filters
          </button>
        </div>
      )}

    </div>
  );
};
