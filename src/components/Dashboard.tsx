import React from 'react';
import { 
  CheckCircle2, 
  Flame, 
  Sparkles, 
  Layers, 
  Clock, 
  ArrowRight, 
  AlertCircle, 
  BookOpen, 
  Star, 
  TrendingUp, 
  Cpu, 
  Globe, 
  Database, 
  Code2, 
  Boxes, 
  LayoutGrid, 
  Play,
  Award,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { CategoryId, Question, UserQuestionProgress } from '../types';
import { allQuestions, categoriesMeta } from '../data';
import { StorageData } from '../utils/storage';

interface DashboardProps {
  storageData: StorageData;
  onSelectCategory: (category: CategoryId) => void;
  onSelectQuestion: (question: Question) => void;
  onStartInterview: () => void;
  onStartFlashcards: (categoryFilter?: CategoryId) => void;
  onViewScenarios: () => void;
  onViewSystemDesign: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  storageData,
  onSelectCategory,
  onSelectQuestion,
  onStartInterview,
  onStartFlashcards,
  onViewScenarios,
  onViewSystemDesign
}) => {
  const totalQuestions = allQuestions.length;
  
  // Calculate completed count
  const completedQuestions = (Object.values(storageData.progress) as UserQuestionProgress[]).filter(
    p => p.status === 'completed' || p.assessmentGrade === 'strong'
  );
  const completedCount = completedQuestions.length;
  const progressPercent = totalQuestions > 0 ? Math.round((completedCount / totalQuestions) * 100) : 0;

  // Calculate weak / difficult questions
  const weakQuestionsList = allQuestions.filter(q => {
    const p = storageData.progress[q.id];
    return p && (p.status === 'difficult' || p.assessmentGrade === 'weak' || p.assessmentGrade === 'dont_know');
  });

  // Calculate favorites
  const favoriteQuestionsList = allQuestions.filter(q => {
    const p = storageData.progress[q.id];
    return p && p.isFavorite;
  });

  // Recently studied
  const recentlyStudied = allQuestions
    .filter(q => storageData.progress[q.id]?.lastStudiedAt)
    .sort((a, b) => {
      const timeA = new Date(storageData.progress[a.id]?.lastStudiedAt || 0).getTime();
      const timeB = new Date(storageData.progress[b.id]?.lastStudiedAt || 0).getTime();
      return timeB - timeA;
    })
    .slice(0, 4);

  // Daily Challenge
  const challengeQuestions = allQuestions
    .filter(q => {
      const p = storageData.progress[q.id];
      return !p || p.status !== 'completed';
    })
    .slice(0, 3);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Globe': return <Globe className="w-5 h-5 text-indigo-600" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-indigo-600" />;
      case 'Layers': return <Layers className="w-5 h-5 text-indigo-600" />;
      case 'Database': return <Database className="w-5 h-5 text-indigo-600" />;
      case 'Code2': return <Code2 className="w-5 h-5 text-indigo-600" />;
      case 'Boxes': return <Boxes className="w-5 h-5 text-indigo-600" />;
      case 'LayoutGrid': return <LayoutGrid className="w-5 h-5 text-indigo-600" />;
      default: return <Sparkles className="w-5 h-5 text-indigo-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      
      {/* Top Banner / Welcome & Target Profile */}
      <div className="rounded-xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Full-Stack Interview Mastery
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Ready for your Full-Stack Interview?
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Tailored for <strong className="text-slate-900">Senior Frontend (Angular/TS)</strong> developers mastering <strong className="text-slate-900">.NET Core, EF Core, SQL, APIs, and Microservices</strong> with natural, spoken English explanations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onStartInterview}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all"
            id="dashboard-start-interview-btn"
          >
            <Sparkles className="w-4 h-4" />
            Mock Interview Simulator
          </button>
          <button
            onClick={() => onStartFlashcards()}
            className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-2 transition-all"
            id="dashboard-start-flashcards-btn"
          >
            <Layers className="w-4 h-4 text-slate-500" />
            Flashcards
          </button>
        </div>
      </div>

      {/* 4 Summary Stats Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Progress */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mastery Rate</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {progressPercent}%
            </div>
            <p className="text-xs text-slate-500">{completedCount} of {totalQuestions} questions completed</p>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Study Streak */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daily Streak</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {storageData.streak.currentStreak} Days
            </div>
            <p className="text-xs text-slate-500">Longest: {storageData.streak.longestStreak} days</p>
          </div>
          <div className="text-[11px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded inline-block">
            Keep the momentum going!
          </div>
        </div>

        {/* Weak Areas / Needs Review */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Needs Review</span>
            <div className="p-2 rounded-lg bg-orange-50 text-orange-600 border border-orange-100">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {weakQuestionsList.length}
            </div>
            <p className="text-xs text-slate-500">Marked as weak or difficult</p>
          </div>
          {weakQuestionsList.length > 0 ? (
            <button
              onClick={() => onStartFlashcards()}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Review Weak Cards <ArrowRight className="w-3 h-3" />
            </button>
          ) : (
            <span className="text-[11px] text-slate-400">All reviewed topics solid</span>
          )}
        </div>

        {/* Saved Favorites */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bookmarked</span>
            <div className="p-2 rounded-lg bg-violet-50 text-violet-600 border border-violet-100">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {favoriteQuestionsList.length}
            </div>
            <p className="text-xs text-slate-500">Key questions for rapid revision</p>
          </div>
          <span className="text-[11px] text-violet-700 font-medium bg-violet-50 px-2 py-0.5 rounded inline-block">
            Fast pre-interview refresh
          </span>
        </div>

      </div>

      {/* Main Pillars Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Curated Interview Pillars
            </h2>
            <p className="text-xs text-slate-500">
              Explore questions categorized by core backend and full-stack technical competencies.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Object.keys(categoriesMeta) as CategoryId[]).map((catId) => {
            const cat = categoriesMeta[catId];
            const catQuestions = allQuestions.filter(q => q.category === catId);
            const catCompleted = catQuestions.filter(q => {
              const p = storageData.progress[q.id];
              return p && (p.status === 'completed' || p.assessmentGrade === 'strong');
            }).length;
            const catPercent = catQuestions.length > 0 ? Math.round((catCompleted / catQuestions.length) * 100) : 0;

            return (
              <div
                key={catId}
                onClick={() => onSelectCategory(catId)}
                className="bg-white border border-slate-200 rounded-xl p-5 cursor-pointer shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-indigo-50 transition-colors">
                      {getCategoryIcon(cat.iconName)}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                      {catCompleted}/{catQuestions.length}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">Readiness</span>
                    <span className="text-slate-700 font-bold font-mono">{catPercent}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 rounded-full transition-all"
                      style={{ width: `${catPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Section: Quick Practice Challenges & Recently Studied */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Daily High-Yield Questions */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Recommended Practice
              </h3>
            </div>
            <span className="text-xs text-slate-400">High-Yield Questions</span>
          </div>

          <div className="space-y-3">
            {challengeQuestions.map((q) => (
              <div
                key={q.id}
                onClick={() => onSelectQuestion(q)}
                className="p-3.5 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 cursor-pointer transition-colors flex items-center justify-between gap-3 group"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase">
                      {q.topic}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {q.difficulty}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 truncate transition-colors">
                    {q.question}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Recently Studied / Activity Log */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Recently Studied
              </h3>
            </div>
            <span className="text-xs text-slate-400">History</span>
          </div>

          {recentlyStudied.length > 0 ? (
            <div className="space-y-3">
              {recentlyStudied.map((q) => (
                <div
                  key={q.id}
                  onClick={() => onSelectQuestion(q)}
                  className="p-3.5 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 cursor-pointer transition-colors flex items-center justify-between gap-3 group"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase">
                        {q.topic}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {q.difficulty}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 truncate transition-colors">
                      {q.question}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-lg border border-slate-200/60">
              No recent questions yet. Start with a pillar above or launch the Mock Interview Simulator!
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
