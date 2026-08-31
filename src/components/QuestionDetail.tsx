import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Star, 
  Copy, 
  Check, 
  Volume2, 
  Timer, 
  Sparkles, 
  MessageSquare, 
  HelpCircle, 
  ShieldAlert, 
  Code2, 
  ChevronDown, 
  ChevronUp,
  Bookmark,
  Share2,
  FileEdit
} from 'lucide-react';
import { CategoryId, Question } from '../types';
import { allQuestions, categoriesMeta } from '../data';
import { StorageData, toggleFavorite, updateQuestionProgress, saveUserNote } from '../utils/storage';

interface QuestionDetailProps {
  question: Question;
  storageData: StorageData;
  onBack: () => void;
  onSelectQuestion: (question: Question) => void;
  onUpdateStorage: () => void;
}

export const QuestionDetail: React.FC<QuestionDetailProps> = ({
  question,
  storageData,
  onBack,
  onSelectQuestion,
  onUpdateStorage
}) => {
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [openFollowUps, setOpenFollowUps] = useState<Record<number, boolean>>({});
  const [practiceTimerSeconds, setPracticeTimerSeconds] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [userNote, setUserNote] = useState('');
  const [isNoteSaved, setIsNoteSaved] = useState(false);

  const currentProgress = storageData.progress[question.id];
  const isMastered = currentProgress?.status === 'completed' || currentProgress?.assessmentGrade === 'strong';
  const isDifficult = currentProgress?.status === 'difficult' || currentProgress?.assessmentGrade === 'weak' || currentProgress?.assessmentGrade === 'dont_know';
  const isFav = currentProgress?.isFavorite;

  // Load existing note & reset states on question change
  useEffect(() => {
    setUserNote(storageData.customNotes[question.id] || '');
    setIsAnswerRevealed(false);
    setIsTimerRunning(false);
    setPracticeTimerSeconds(60);
    setOpenFollowUps({});
  }, [question.id, storageData.customNotes]);

  // Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && practiceTimerSeconds > 0) {
      interval = setInterval(() => {
        setPracticeTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (practiceTimerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setIsAnswerRevealed(true);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, practiceTimerSeconds]);

  // Next and previous questions
  const currentIndex = allQuestions.findIndex(q => q.id === question.id);
  const prevQuestion = currentIndex > 0 ? allQuestions[currentIndex - 1] : null;
  const nextQuestion = currentIndex < allQuestions.length - 1 ? allQuestions[currentIndex + 1] : null;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSaveNote = () => {
    saveUserNote(question.id, userNote);
    setIsNoteSaved(true);
    setTimeout(() => setIsNoteSaved(false), 2000);
    onUpdateStorage();
  };

  const toggleFollowUp = (index: number) => {
    setOpenFollowUps(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleMarkGrade = (grade: 'weak' | 'okay' | 'strong') => {
    const status = grade === 'strong' ? 'completed' : 'difficult';
    updateQuestionProgress(question.id, { status, assessmentGrade: grade });
    onUpdateStorage();
  };

  const handleToggleFav = () => {
    toggleFavorite(question.id);
    onUpdateStorage();
  };

  const category = categoriesMeta[question.category];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-6">
      
      {/* Top Header Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          id="back-to-list-btn"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Question Bank
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            Question {currentIndex + 1} of {allQuestions.length}
          </span>
          {prevQuestion && (
            <button
              onClick={() => onSelectQuestion(prevQuestion)}
              className="px-3 py-1.5 rounded-md bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold border border-slate-200 flex items-center gap-1 shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Previous
            </button>
          )}
          {nextQuestion && (
            <button
              onClick={() => onSelectQuestion(nextQuestion)}
              className="px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1"
              id="next-question-btn"
            >
              Next <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Question Heading Block */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase rounded border border-indigo-100">
              {category?.name || question.category}
            </span>
            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded">
              {question.topic}
            </span>
            <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded border ${
              question.difficulty === 'Strong Mid' 
                ? 'bg-orange-50 text-orange-700 border-orange-200' 
                : question.difficulty === 'Advanced'
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {question.difficulty}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-snug">
            {question.question}
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleToggleFav}
            className={`p-2 rounded-lg border transition-all ${
              isFav 
                ? 'bg-amber-50 border-amber-300 text-amber-500' 
                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
            }`}
            title={isFav ? "Saved to Favorites" : "Add to Favorites"}
          >
            <Star className={`w-5 h-5 ${isFav ? 'fill-amber-400' : ''}`} />
          </button>
          <button
            onClick={() => setIsAnswerRevealed(!isAnswerRevealed)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              isAnswerRevealed 
                ? 'bg-slate-100 text-slate-700 border border-slate-200' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
            }`}
            id="reveal-answer-toggle-btn"
          >
            {isAnswerRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {isAnswerRevealed ? 'Hide Solution' : 'Reveal Solution'}
          </button>
        </div>
      </div>

      {/* Spoken English Rehearsal Callout */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-950">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
              Spoken Interview Rehearsal
            </span>
            <p className="text-xs text-amber-800 leading-relaxed mt-0.5">
              Practice answering out loud before checking the model explanation below.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setIsTimerRunning(!isTimerRunning);
            if (!isTimerRunning && practiceTimerSeconds === 0) setPracticeTimerSeconds(60);
          }}
          className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 border transition-all shrink-0 ${
            isTimerRunning 
              ? 'bg-red-100 border-red-300 text-red-800' 
              : 'bg-white border-amber-300 text-amber-900 hover:bg-amber-100'
          }`}
        >
          <Timer className="w-3.5 h-3.5" />
          {isTimerRunning ? `Timer: ${practiceTimerSeconds}s (Pause)` : practiceTimerSeconds === 60 ? 'Start 60s Rehearsal' : `Resume (${practiceTimerSeconds}s)`}
        </button>
      </div>

      {/* Conversational Opener Tip */}
      {question.spokenTip && (
        <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-start gap-2.5">
          <MessageSquare className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-indigo-950">Natural Conversational Opener: </strong>
            <span className="italic">"{question.spokenTip}"</span>
          </div>
        </div>
      )}

      {/* Answer Body */}
      {!isAnswerRevealed ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center space-y-4 shadow-sm">
          <Sparkles className="w-8 h-8 text-indigo-500 mx-auto opacity-80" />
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Answer Hidden for Active Self-Testing
            </h3>
            <p className="text-xs text-slate-500">
              Speak your answer out loud for 30–60 seconds in English, then reveal to compare with the senior answer structure.
            </p>
          </div>
          <button
            onClick={() => setIsAnswerRevealed(true)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
            id="reveal-answer-main-btn"
          >
            Reveal Model Answer & Code
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Section 1: Short Answer */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Short Answer
            </h3>
            <p className="text-slate-700 leading-relaxed font-medium text-sm">
              {question.shortAnswer}
            </p>
          </section>

          {/* Section 2: The Interview Answer */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              The Interview Answer
            </h3>
            <p className="text-slate-700 leading-relaxed italic text-sm whitespace-pre-line">
              "{question.interviewAnswer}"
            </p>
          </section>

          {/* Section 3 & 4 Grid: Code Example & Senior Point */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Practical Code Example */}
            {question.example ? (
              <section className="bg-slate-900 p-6 rounded-xl text-slate-300 font-mono text-xs leading-relaxed flex flex-col justify-between space-y-4 shadow-sm border border-slate-800">
                <div className="space-y-3">
                  <div className="flex items-center justify-between font-sans">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Example ({question.example.language.toUpperCase()})
                    </h3>
                    <button
                      onClick={() => handleCopyCode(question.example!.code)}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 transition-colors"
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedCode ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre className="overflow-x-auto whitespace-pre font-mono text-indigo-200">
                    <code>{question.example.code}</code>
                  </pre>
                </div>
                {question.example.explanation && (
                  <p className="text-[11px] text-slate-400 font-sans border-t border-slate-800 pt-3">
                    <strong className="text-slate-300">Explanation: </strong>{question.example.explanation}
                  </p>
                )}
              </section>
            ) : (
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex items-center justify-center text-xs text-slate-400 text-center">
                Conceptual Architecture Discussion (No Code Required)
              </div>
            )}

            {/* Senior Point Nuance */}
            {question.seniorPoint ? (
              <section className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-widest mb-3">
                    Senior Point & Trade-offs
                  </h3>
                  <p className="text-indigo-950 text-xs sm:text-sm leading-relaxed font-medium">
                    {question.seniorPoint}
                  </p>
                </div>
                <div className="text-[11px] text-indigo-600 font-semibold flex items-center gap-1.5 pt-2 border-t border-indigo-100">
                  <Sparkles className="w-3.5 h-3.5" /> Demonstrates high architectural maturity
                </div>
              </section>
            ) : null}

          </div>

          {/* Section 5: Key Points Checklist */}
          {question.keyPointsToMention && question.keyPointsToMention.length > 0 && (
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Key Points to Mention (Self-Grading Checklist)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {question.keyPointsToMention.map((point, i) => (
                  <div key={i} className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200/80 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section 6: Follow-up Questions */}
          {question.followUps && question.followUps.length > 0 && (
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Common Interview Follow-ups
              </h3>
              <div className="space-y-2.5">
                {question.followUps.map((fu, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleFollowUp(idx)}
                      className="w-full p-3.5 text-left text-xs font-bold text-slate-800 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <span>Q: {fu.question}</span>
                      {openFollowUps[idx] ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                    </button>
                    {openFollowUps[idx] && (
                      <div className="p-3.5 border-t border-slate-100 bg-slate-50 text-xs text-slate-600 leading-relaxed">
                        <strong className="text-indigo-700">Answer: </strong>
                        {fu.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section 7: Personal Study Notes */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <FileEdit className="w-3.5 h-3.5 text-slate-400" />
                Personal Study Notes
              </h3>
              {isNoteSaved && (
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Note saved
                </span>
              )}
            </div>
            <textarea
              rows={3}
              value={userNote}
              onChange={(e) => setUserNote(e.target.value)}
              placeholder="Record your personal talking points, project anecdotes, or reminders..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
            />
            <button
              onClick={handleSaveNote}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md transition-colors"
            >
              Save Note
            </button>
          </section>

          {/* Bottom Floating/Sticky Rating Footer */}
          <footer className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Self Grade:</span>
              <button
                onClick={() => handleMarkGrade('weak')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                  currentProgress?.assessmentGrade === 'weak'
                    ? 'bg-red-600 text-white border-red-600 shadow-xs'
                    : 'text-red-700 border-red-200 bg-red-50 hover:bg-red-100'
                }`}
              >
                Weak
              </button>
              <button
                onClick={() => handleMarkGrade('okay')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                  currentProgress?.assessmentGrade === 'okay'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'text-amber-700 border-amber-200 bg-amber-50 hover:bg-amber-100'
                }`}
              >
                Okay
              </button>
              <button
                onClick={() => handleMarkGrade('strong')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                  currentProgress?.assessmentGrade === 'strong'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                }`}
              >
                Strong
              </button>
            </div>

            <div className="flex items-center gap-3">
              {nextQuestion && (
                <button
                  onClick={() => onSelectQuestion(nextQuestion)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center gap-1"
                >
                  Next Question <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </footer>

        </div>
      )}

    </div>
  );
};
