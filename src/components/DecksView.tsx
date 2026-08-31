import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Play, 
  MoreVertical, 
  Sparkles, 
  Trash2, 
  Download, 
  Upload, 
  FolderPlus,
  BookOpen,
  Search,
  Code2,
  Server,
  Layers
} from 'lucide-react';
import { Card, Deck } from '../types';

interface DecksViewProps {
  decks: Deck[];
  cards: Card[];
  onSelectDeckToStudy: (deck: Deck | null) => void;
  onOpenAddCard: (deckId?: string) => void;
  onCreateDeck: (deck: { name: string; description: string; color: string }) => void;
  onDeleteDeck: (deckId: string) => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
  onRestoreDefaultDecks?: () => void;
}

const FRONTEND_CATEGORIES = new Set([
  'javascript', 'typescript', 'angular', 'rxjs', 'statemanagement',
  'htmlcss', 'browser', 'performance', 'architecture', 'security',
  'testing', 'patterns', 'a11y', 'tooling', 'gitworkflow',
  'fesystemdesign', 'fescenarios', 'reactcore', 'reactadvanced'
]);

const BACKEND_CATEGORIES = new Set([
  'web', 'dotnet', 'efcore', 'sql', 'apidesign',
  'microservices', 'systemdesign', 'scenarios'
]);

export function DecksView({
  decks,
  cards,
  onSelectDeckToStudy,
  onOpenAddCard,
  onCreateDeck,
  onDeleteDeck,
  onExportData,
  onImportData,
  onRestoreDefaultDecks
}: DecksViewProps) {
  const [activeMenuDeckId, setActiveMenuDeckId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDesc, setNewDeckDesc] = useState('');
  const [newDeckColor, setNewDeckColor] = useState('#6366F1');
  const [filterTrack, setFilterTrack] = useState<'all' | 'frontend' | 'backend' | 'custom'>('frontend');
  const [searchQuery, setSearchQuery] = useState('');

  const now = Date.now();

  // Compute live counts per deck
  const deckStats = useMemo(() => {
    return decks.map((deck) => {
      const deckCards = cards.filter(c => c.deckId === deck.id);
      const newCount = deckCards.filter(c => c.state === 'new').length;
      const learnCount = deckCards.filter(c => c.state === 'learning' || c.state === 'relearning').length;
      const reviewCount = deckCards.filter(c => c.state === 'review' && c.due <= now).length;
      const totalDue = newCount + learnCount + reviewCount;

      return {
        deck,
        totalCards: deckCards.length,
        newCount,
        learnCount,
        reviewCount,
        totalDue
      };
    });
  }, [decks, cards, now]);

  // Filtered decks based on track and search query
  const filteredDeckStats = useMemo(() => {
    return deckStats.filter(({ deck }) => {
      const cat = deck.category;
      if (filterTrack === 'frontend' && !FRONTEND_CATEGORIES.has(cat)) return false;
      if (filterTrack === 'backend' && !BACKEND_CATEGORIES.has(cat)) return false;
      if (filterTrack === 'custom' && (FRONTEND_CATEGORIES.has(cat) || BACKEND_CATEGORIES.has(cat))) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = deck.name.toLowerCase().includes(q);
        const matchDesc = deck.description?.toLowerCase().includes(q);
        const matchCat = deck.category.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchCat) return false;
      }

      return true;
    });
  }, [deckStats, filterTrack, searchQuery]);

  const totalAllDue = deckStats.reduce((sum, s) => sum + s.totalDue, 0);
  const totalAllNew = deckStats.reduce((sum, s) => sum + s.newCount, 0);
  const totalAllLearn = deckStats.reduce((sum, s) => sum + s.learnCount, 0);
  const totalAllReview = deckStats.reduce((sum, s) => sum + s.reviewCount, 0);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckName.trim()) return;
    onCreateDeck({
      name: newDeckName.trim(),
      description: newDeckDesc.trim() || 'Custom flashcard deck',
      color: newDeckColor
    });
    setNewDeckName('');
    setNewDeckDesc('');
    setShowCreateModal(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportData(file);
      e.target.value = '';
    }
  };

  const colors = [
    '#6366F1', // Indigo
    '#3B82F6', // Blue
    '#06B6D4', // Cyan
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#EC4899', // Pink
    '#8B5CF6'  // Purple
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24 space-y-4">
      
      {/* Overall Daily Progress Summary Card */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Daily SRS Queue
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {totalAllDue} Cards Due Today
            </h2>
          </div>

          <button
            onClick={() => onSelectDeckToStudy(null)}
            disabled={totalAllDue === 0}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-95 ${
              totalAllDue > 0
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Study All</span>
          </button>
        </div>

        {/* Anki Count Pill Legend */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/60 text-center">
          <div className="bg-blue-950/40 border border-blue-800/40 rounded-xl py-2 px-3">
            <div className="text-xs font-semibold text-blue-400 uppercase tracking-wide">New</div>
            <div className="text-lg font-black text-blue-300">{totalAllNew}</div>
          </div>
          <div className="bg-amber-950/40 border border-amber-800/40 rounded-xl py-2 px-3">
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Learn</div>
            <div className="text-lg font-black text-amber-300">{totalAllLearn}</div>
          </div>
          <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-xl py-2 px-3">
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">To Review</div>
            <div className="text-lg font-black text-emerald-300">{totalAllReview}</div>
          </div>
        </div>
      </div>

      {/* Track Filters (Frontend vs Full-Stack vs Custom) */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl overflow-x-auto scrollbar-none">
        <button
          onClick={() => setFilterTrack('frontend')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
            filterTrack === 'frontend'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Frontend Track (19)</span>
        </button>

        <button
          onClick={() => setFilterTrack('backend')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
            filterTrack === 'backend'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Backend & Full-Stack (8)</span>
        </button>

        <button
          onClick={() => setFilterTrack('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
            filterTrack === 'all'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Decks ({decks.length})</span>
        </button>
      </div>

      {/* Quick Search & Actions */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search decks & topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-800 focus:border-indigo-500 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <label className="p-2 rounded-xl bg-slate-800/90 border border-slate-700 hover:bg-slate-700 text-slate-300 cursor-pointer text-xs flex items-center gap-1 active:scale-95 transition-all" title="Import JSON / Cards">
            <Upload className="w-3.5 h-3.5" />
            <input type="file" accept=".json,.csv" onChange={handleFileChange} className="hidden" />
          </label>

          <button
            onClick={onExportData}
            className="p-2 rounded-xl bg-slate-800/90 border border-slate-700 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 active:scale-95 transition-all"
            title="Export Backup"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 text-indigo-300 text-xs font-bold active:scale-95 transition-all"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Deck</span>
          </button>
        </div>
      </div>

      {/* Deck List Items */}
      <div className="space-y-2.5">
        {filteredDeckStats.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-3">
            <BookOpen className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">
              {searchQuery ? 'No decks match your search query.' : 'No decks in this track yet.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Clear Search
                </button>
              )}
              {onRestoreDefaultDecks && (
                <button
                  onClick={onRestoreDefaultDecks}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Sync & Load All 19 Frontend Decks</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          filteredDeckStats.map(({ deck, totalCards, newCount, learnCount, reviewCount, totalDue }) => {
            const isMenuOpen = activeMenuDeckId === deck.id;

            return (
              <div
                key={deck.id}
                className="relative bg-slate-800/60 hover:bg-slate-800/90 border border-slate-700/60 hover:border-slate-600/80 rounded-2xl p-3.5 transition-all shadow-sm group"
              >
                <div className="flex items-center justify-between gap-3">
                  
                  {/* Clickable Deck Main Info */}
                  <div 
                    onClick={() => onSelectDeckToStudy(deck)}
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer select-none"
                  >
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md font-bold text-white text-base"
                      style={{ backgroundColor: deck.color || '#6366F1' }}
                    >
                      {deck.name.substring(0, 2).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm sm:text-base font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
                          {deck.name}
                        </h4>
                        {deck.isDefault && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                            Built-in
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate">
                        {totalCards} cards &bull; {deck.description}
                      </p>
                    </div>
                  </div>

                  {/* Anki 3-Column Badges & Options */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div 
                      onClick={() => onSelectDeckToStudy(deck)}
                      className="flex items-center gap-1.5 cursor-pointer select-none bg-slate-900/60 px-2.5 py-1.5 rounded-xl border border-slate-700/50"
                    >
                      {/* Blue: New */}
                      <span className="text-xs font-black text-blue-400 min-w-[16px] text-center" title="New cards">
                        {newCount}
                      </span>
                      <span className="text-slate-600 text-xs">|</span>
                      {/* Orange: Learn */}
                      <span className="text-xs font-black text-amber-400 min-w-[16px] text-center" title="Learning cards">
                        {learnCount}
                      </span>
                      <span className="text-slate-600 text-xs">|</span>
                      {/* Green: Due */}
                      <span className="text-xs font-black text-emerald-400 min-w-[16px] text-center" title="Review cards due">
                        {reviewCount}
                      </span>
                    </div>

                    {/* Options Menu Trigger */}
                    <button
                      onClick={() => setActiveMenuDeckId(isMenuOpen ? null : deck.id)}
                      className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>

                </div>

                {/* Context Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-3 top-14 z-30 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 min-w-[180px] space-y-1 animate-in fade-in zoom-in-95 duration-100">
                    <button
                      onClick={() => {
                        onSelectDeckToStudy(deck);
                        setActiveMenuDeckId(null);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-slate-800 text-left"
                    >
                      <Play className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Study Deck ({totalDue} due)</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenAddCard(deck.id);
                        setActiveMenuDeckId(null);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-slate-800 text-left"
                    >
                      <Plus className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Add Card to Deck</span>
                    </button>

                    {!deck.isDefault && (
                      <button
                        onClick={() => {
                          if (confirm(`Delete deck "${deck.name}" and all its cards?`)) {
                            onDeleteDeck(deck.id);
                          }
                          setActiveMenuDeckId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-950/40 text-left"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Deck</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create Deck Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-indigo-400" />
              <span>Create New Deck</span>
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Deck Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js App Router & SSR"
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Master Server Components, streaming SSR, and actions"
                  value={newDeckDesc}
                  onChange={(e) => setNewDeckDesc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Deck Color</label>
                <div className="flex items-center gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewDeckColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        newDeckColor === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                >
                  Create Deck
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
