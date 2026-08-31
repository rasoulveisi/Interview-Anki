import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Play, 
  Timer, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  ArrowRight, 
  RotateCcw, 
  Award, 
  ThumbsUp, 
  ThumbsDown, 
  HelpCircle, 
  ArrowLeft,
  Volume2,
  ListChecks,
  Filter,
  Check
} from 'lucide-react';
import { AssessmentGrade, CategoryId, DifficultyLevel, MockInterviewResultItem, Question } from '../types';
import { allQuestions, categoriesMeta } from '../data';
import { StorageData, updateQuestionProgress } from '../utils/storage';
import confetti from 'canvas-confetti';

interface InterviewModeProps {
  storageData: StorageData;
  onExit: () => void;
  onUpdateStorage: () => void;
  onSelectQuestion: (question: Question) => void;
}

export const InterviewMode: React.FC<InterviewModeProps> = ({
  storageData,
  onExit,
  onUpdateStorage,
  onSelectQuestion
}) => {
  // Session Configuration State
  const [isConfiguring, setIsConfiguring] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<CategoryId[]>(
    Object.keys(categoriesMeta) as CategoryId[]
  );
  const [questionCount, setQuestionCount] = useState<number>(7);
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyLevel | 'All'>('All');
  const [onlyWeakOrUnseen, setOnlyWeakOrUnseen] = useState(false);

  // Active Session State
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [results, setResults] = useState<MockInterviewResultItem[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = sessionQuestions[currentIndex];

  // Timer Countdown
  useEffect(() => {
    let interval: any = null;
    if (!isConfiguring && !isFinished && isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConfiguring, isFinished, isTimerRunning, timerSeconds]);

  const toggleCategory = (catId: CategoryId) => {
    if (selectedCategories.includes(catId)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter(c => c !== catId));
      }
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  const selectFrontendOnly = () => {
    const feCategories: CategoryId[] = [
      'javascript', 'typescript', 'angular', 'rxjs', 'statemanagement',
      'htmlcss', 'browser', 'performance', 'architecture', 'security',
      'testing', 'patterns', 'a11y', 'tooling', 'gitworkflow',
      'fesystemdesign', 'fescenarios', 'reactcore', 'reactadvanced'
    ];
    setSelectedCategories(feCategories);
  };

  const selectBackendOnly = () => {
    const beCategories: CategoryId[] = [
      'web', 'dotnet', 'efcore', 'sql', 'apidesign', 'microservices', 'systemdesign', 'scenarios'
    ];
    setSelectedCategories(beCategories);
  };

  const selectAll = () => {
    setSelectedCategories(Object.keys(categoriesMeta) as CategoryId[]);
  };

  const handleStartSession = () => {
    let pool = allQuestions.filter(q => selectedCategories.includes(q.category));
    
    if (difficultyFilter !== 'All') {
      pool = pool.filter(q => q.difficulty === difficultyFilter);
    }

    if (onlyWeakOrUnseen) {
      pool = pool.filter(q => {
        const p = storageData.progress[q.id];
        return !p || p.status === 'difficult' || p.assessmentGrade === 'weak' || p.assessmentGrade === 'dont_know';
      });
    }

    // Shuffle pool
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));

    if (selected.length === 0) {
      alert('No questions match the chosen filters. Please adjust your criteria.');
      return;
    }

    setSessionQuestions(selected);
    setCurrentIndex(0);
    setResults([]);
    setIsAnswerRevealed(false);
    setTimerSeconds(120);
    setIsTimerRunning(true);
    setIsFinished(false);
    setIsConfiguring(false);
  };

  const handleGrade = (grade: AssessmentGrade) => {
    const newResult: MockInterviewResultItem = {
      questionId: currentQuestion.id,
      category: currentQuestion.category,
      questionText: currentQuestion.question,
      grade,
      timeSpentSeconds: 120 - timerSeconds
    };

    const updatedResults = [...results, newResult];
    setResults(updatedResults);

    // Save progress to storage
    const status = (grade === 'strong' || grade === 'okay') ? 'completed' : 'difficult';
    updateQuestionProgress(currentQuestion.id, {
      status,
      assessmentGrade: grade
    });
    onUpdateStorage();

    // Advance or finish
    if (currentIndex < sessionQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsAnswerRevealed(false);
      setTimerSeconds(120);
      setIsTimerRunning(true);
    } else {
      setIsFinished(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  // 1. Configuration Screen
  if (isConfiguring) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <button
            onClick={onExit}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Verbal Simulation Mode
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Mock Interview Simulator Setup
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              Simulate realistic full-stack interview rounds. You get a 2-minute countdown per question to rehearse your response out loud in English before comparing with senior benchmarks.
            </p>
          </div>

          <div className="space-y-5 pt-2">
            
            {/* Category Selectors */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Target Topics ({selectedCategories.length}/{Object.keys(categoriesMeta).length} Selected)
                </label>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                  >
                    All (27)
                  </button>
                  <button
                    type="button"
                    onClick={selectFrontendOnly}
                    className="px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold"
                  >
                    Frontend (19)
                  </button>
                  <button
                    type="button"
                    onClick={selectBackendOnly}
                    className="px-2 py-0.5 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold"
                  >
                    Backend (8)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-1 border border-slate-200 rounded-lg bg-slate-50/50">
                {(Object.keys(categoriesMeta) as CategoryId[]).map((catId) => {
                  const isSelected = selectedCategories.includes(catId);
                  return (
                    <button
                      key={catId}
                      onClick={() => toggleCategory(catId)}
                      className={`p-2.5 rounded-lg text-xs font-semibold text-left border transition-all flex items-center justify-between ${
                        isSelected 
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-xs' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">{categoriesMeta[catId].name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question Count and Difficulty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                  Question Count / Round Limit
                </label>
                <div className="grid grid-cols-6 gap-1.5">
                  {[3, 5, 7, 10, 15, 999].map((num) => (
                    <button
                      key={num}
                      onClick={() => setQuestionCount(num)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        questionCount === num
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {num === 999 ? 'All' : num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                  Target Difficulty
                </label>
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All">All Difficulties</option>
                  <option value="Senior">Senior</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Strong Mid">Strong Mid</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Beginner">Beginner</option>
                </select>
              </div>
            </div>

            {/* Only weak toggle */}
            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyWeakOrUnseen}
                onChange={(e) => setOnlyWeakOrUnseen(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-800">Focus on Weak & Unstudied Topics</span>
                <p className="text-[11px] text-slate-500">Prioritizes questions where you need the most repetition.</p>
              </div>
            </label>

          </div>

          <button
            onClick={handleStartSession}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all"
            id="start-interview-session-btn"
          >
            <Play className="w-4 h-4" /> Start Mock Interview Session
          </button>
        </div>

      </div>
    );
  }

  // 2. Results Screen
  if (isFinished) {
    const strongCount = results.filter(r => r.grade === 'strong').length;
    const okayCount = results.filter(r => r.grade === 'okay').length;
    const weakCount = results.filter(r => r.grade === 'weak' || r.grade === 'dont_know').length;
    const scorePercent = Math.round(((strongCount * 1 + okayCount * 0.5) / results.length) * 100);

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <Award className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900">
              Mock Interview Completed!
            </h1>
            <p className="text-xs text-slate-500">
              Great rehearsal session! Here is the breakdown of your performance:
            </p>
          </div>

          {/* Metric Pill Grid */}
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-lg">
              <span className="text-xs text-emerald-800 font-medium block">Strong</span>
              <span className="text-xl font-bold text-emerald-700 font-mono">{strongCount}</span>
            </div>
            <div className="p-3.5 bg-amber-50 border border-amber-100 rounded-lg">
              <span className="text-xs text-amber-800 font-medium block">Okay</span>
              <span className="text-xl font-bold text-amber-700 font-mono">{okayCount}</span>
            </div>
            <div className="p-3.5 bg-red-50 border border-red-100 rounded-lg">
              <span className="text-xs text-red-800 font-medium block">Weak</span>
              <span className="text-xl font-bold text-red-700 font-mono">{weakCount}</span>
            </div>
          </div>

          {/* List of completed questions in session */}
          <div className="space-y-2 text-left pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Session Question Log
            </h3>
            <div className="space-y-2">
              {results.map((res, i) => {
                const q = sessionQuestions.find(sq => sq.id === res.questionId);
                if (!q) return null;

                return (
                  <div 
                    key={i}
                    onClick={() => onSelectQuestion(q)}
                    className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between gap-3 cursor-pointer text-xs transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-slate-800 block truncate">{q.question}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{q.topic} &bull; {res.timeSpentSeconds}s response time</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      res.grade === 'strong'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : res.grade === 'okay'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {res.grade.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => setIsConfiguring(true)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Start New Session
            </button>
            <button
              onClick={onExit}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
            >
              Exit to Dashboard
            </button>
          </div>

        </div>
      </div>
    );
  }

  // 3. Active Interview Question Screen
  const categoryMeta = categoriesMeta[currentQuestion.category];
  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-6">
      
      {/* Session Progress Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsConfiguring(true)}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Abort Session
          </button>
          <span className="text-slate-300">|</span>
          <span className="text-xs font-mono text-slate-500">
            Question {currentIndex + 1} of {sessionQuestions.length}
          </span>
        </div>

        {/* Live Timer */}
        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold font-mono border ${
          timerSeconds < 30 
            ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' 
            : 'bg-slate-100 border-slate-200 text-slate-700'
        }`}>
          <Timer className="w-4 h-4" />
          <span>{formattedTime}</span>
        </div>
      </div>

      {/* Main Question Display Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-5">
        
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase rounded border border-indigo-100">
            {categoryMeta?.name}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            {currentQuestion.topic}
          </span>
          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-100 text-slate-600">
            {currentQuestion.difficulty}
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
          {currentQuestion.question}
        </h2>

        {/* Verbal Opener Hint */}
        {currentQuestion.spokenTip && (
          <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg text-xs text-indigo-900 flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span><strong>Suggested Opener: </strong>"{currentQuestion.spokenTip}"</span>
          </div>
        )}

      </div>

      {/* Answer Reveal Section */}
      {!isAnswerRevealed ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center space-y-3 shadow-sm">
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Speak your answer out loud as if in a live interview room. When finished speaking, reveal the answer to benchmark your points.
          </p>
          <button
            onClick={() => {
              setIsAnswerRevealed(true);
              setIsTimerRunning(false);
            }}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
            id="reveal-interview-answer-btn"
          >
            I'm Done Speaking &bull; Benchmark Answer
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Elevator Pitch Answer */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Model Senior Answer
            </h3>
            <p className="text-sm text-slate-800 leading-relaxed font-medium">
              {currentQuestion.shortAnswer}
            </p>
          </div>

          {/* Key Points Checklist */}
          {currentQuestion.keyPointsToMention && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Critical Points Checklist (Did you mention these?)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentQuestion.keyPointsToMention.map((pt, i) => (
                  <div key={i} className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200/80 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Self Grade Action Footer */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3 text-center">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              How well did you articulate your spoken response?
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-xl mx-auto pt-1">
              <button
                onClick={() => handleGrade('strong')}
                className="p-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-all flex flex-col items-center gap-1"
                id="grade-strong-btn"
              >
                <ThumbsUp className="w-4 h-4 text-emerald-600" />
                <span>Strong (Clear & Complete)</span>
              </button>
              <button
                onClick={() => handleGrade('okay')}
                className="p-3 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold transition-all flex flex-col items-center gap-1"
                id="grade-okay-btn"
              >
                <Check className="w-4 h-4 text-amber-600" />
                <span>Okay (Minor Gaps)</span>
              </button>
              <button
                onClick={() => handleGrade('weak')}
                className="p-3 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-800 text-xs font-bold transition-all flex flex-col items-center gap-1"
                id="grade-weak-btn"
              >
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <span>Weak (Struggled / Incomplete)</span>
              </button>
              <button
                onClick={() => handleGrade('dont_know')}
                className="p-3 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-800 text-xs font-bold transition-all flex flex-col items-center gap-1"
                id="grade-dontknow-btn"
              >
                <ThumbsDown className="w-4 h-4 text-red-600" />
                <span>Didn't Know</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
