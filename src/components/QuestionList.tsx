import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Bookmark, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ChevronRight, 
  BookOpen, 
  Star,
  Layers,
  Code2
} from 'lucide-react';
import { CategoryId, DifficultyLevel, Question } from '../types';
import { allQuestions, categoriesMeta, searchQuestions } from '../data';
import { StorageData, toggleFavorite } from '../utils/storage';

interface QuestionListProps {
  selectedCategory: CategoryId | 'all';
  setSelectedCategory: (cat: CategoryId | 'all') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  storageData: StorageData;
  onSelectQuestion: (question: Question) => void;
  onUpdateStorage: () => void;
}

export const QuestionList: React.FC<QuestionListProps> = ({
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  storageData,
  onSelectQuestion,
  onUpdateStorage
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'completed' | 'difficult' | 'favorites' | 'unseen'>('all');
  const [selectedTag, setSelectedTag] = useState<string | 'all'>('all');

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    allQuestions.forEach(q => q.tags.forEach(t => set.add(t)));
    return Array.from(set).sort();
  }, []);

  // Filter questions
  const filteredQuestions = useMemo(() => {
    let result = searchQuery ? searchQuestions(searchQuery) : allQuestions;

    if (selectedCategory !== 'all') {
      result = result.filter(q => q.category === selectedCategory);
    }

    if (selectedDifficulty !== 'All') {
      result = result.filter(q => q.difficulty === selectedDifficulty);
    }

    if (selectedTag !== 'all') {
      result = result.filter(q => q.tags.includes(selectedTag));
    }

    if (selectedStatus === 'completed') {
      result = result.filter(q => {
        const p = storageData.progress[q.id];
        return p && (p.status === 'completed' || p.assessmentGrade === 'strong');
      });
    } else if (selectedStatus === 'difficult') {
      result = result.filter(q => {
        const p = storageData.progress[q.id];
        return p && (p.status === 'difficult' || p.assessmentGrade === 'weak' || p.assessmentGrade === 'dont_know');
      });
    } else if (selectedStatus === 'favorites') {
      result = result.filter(q => storageData.progress[q.id]?.isFavorite);
    } else if (selectedStatus === 'unseen') {
      result = result.filter(q => !storageData.progress[q.id]);
    }

    return result;
  }, [searchQuery, selectedCategory, selectedDifficulty, selectedTag, selectedStatus, storageData]);

  const handleToggleFav = (e: React.MouseEvent, questionId: string) => {
    e.stopPropagation();
    toggleFavorite(questionId);
    onUpdateStorage();
  };

  const getDifficultyBadge = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'Beginner':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">Beginner</span>;
      case 'Intermediate':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">Intermediate</span>;
      case 'Strong Mid':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">Strong Mid</span>;
      case 'Advanced':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">Advanced</span>;
    }
  };

  const currentCategoryMeta = selectedCategory !== 'all' ? categoriesMeta[selectedCategory] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
      
      {/* Category Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Question Catalog
            </span>
            {selectedCategory !== 'all' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                {currentCategoryMeta?.name}
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {selectedCategory === 'all' ? 'All Interview Questions' : currentCategoryMeta?.name}
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            {selectedCategory === 'all' 
              ? 'Browse the complete structured catalog of senior frontend & backend .NET interview questions.'
              : currentCategoryMeta?.description}
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shrink-0">
          <strong>{filteredQuestions.length}</strong> questions listed
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
        
        {/* Top Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All' },
              { id: 'completed', label: 'Mastered' },
              { id: 'difficult', label: 'Needs Review' },
              { id: 'favorites', label: 'Bookmarked' },
              { id: 'unseen', label: 'Unstudied' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  selectedStatus === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Difficulty:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Strong Mid">Strong Mid</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

        </div>

        {/* Tags / Sub-topic Pill Row */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto pb-1 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Tags:</span>
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors shrink-0 ${
                selectedTag === 'all' 
                  ? 'bg-slate-800 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors shrink-0 ${
                  selectedTag === tag 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((q) => {
            const prog = storageData.progress[q.id];
            const isCompleted = prog?.status === 'completed' || prog?.assessmentGrade === 'strong';
            const isDifficult = prog?.status === 'difficult' || prog?.assessmentGrade === 'weak' || prog?.assessmentGrade === 'dont_know';
            const isFav = prog?.isFavorite;
            const categoryMeta = categoriesMeta[q.category];

            return (
              <div
                key={q.id}
                onClick={() => onSelectQuestion(q)}
                className="bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-5 cursor-pointer shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-2 min-w-0 flex-1">
                  
                  {/* Category & Topic Line */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase rounded border border-indigo-100">
                      {categoryMeta?.name || q.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {q.topic}
                    </span>
                    {getDifficultyBadge(q.difficulty)}
                  </div>

                  {/* Question Heading */}
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {q.question}
                  </h3>

                  {/* Elevator Pitch Preview */}
                  <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed">
                    {q.shortAnswer}
                  </p>
                </div>

                {/* Right Side Status & Bookmark */}
                <div className="flex items-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  
                  {/* Status Indicator */}
                  {isCompleted && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mastered
                    </span>
                  )}
                  {isDifficult && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                      <AlertCircle className="w-3.5 h-3.5" /> Review
                    </span>
                  )}

                  {/* Bookmark Button */}
                  <button
                    onClick={(e) => handleToggleFav(e, q.id)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      isFav 
                        ? 'bg-amber-50 border-amber-300 text-amber-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
                    }`}
                    title={isFav ? "Saved" : "Save"}
                  >
                    <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                  </button>

                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3 shadow-sm">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No questions match your current filters</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try selecting "All" categories, clearing the search query, or resetting the difficulty selector.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedDifficulty('All');
                setSelectedStatus('all');
                setSelectedTag('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
