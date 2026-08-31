import { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Star, 
  Edit3, 
  Trash2, 
  RotateCcw, 
  PauseCircle, 
  PlayCircle,
  Plus,
  Layers,
  ChevronDown
} from 'lucide-react';
import { Card, CardState, Deck } from '../types';
import { getCardBadgeColor } from '../utils/srs';

interface CardBrowserViewProps {
  cards: Card[];
  decks: Deck[];
  onEditCard: (card: Card) => void;
  onDeleteCard: (cardId: string) => void;
  onResetCardSRS: (card: Card) => void;
  onToggleSuspend: (card: Card) => void;
  onToggleFavorite: (card: Card) => void;
  onOpenAddCard: () => void;
}

export function CardBrowserView({
  cards,
  decks,
  onEditCard,
  onDeleteCard,
  onResetCardSRS,
  onToggleSuspend,
  onToggleFavorite,
  onOpenAddCard
}: CardBrowserViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeckId, setSelectedDeckId] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const deckMap = useMemo(() => {
    return new Map(decks.map(d => [d.id, d]));
  }, [decks]);

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      // Search term matching
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesFront = card.front.toLowerCase().includes(query);
        const matchesBack = card.back.toLowerCase().includes(query);
        const matchesNotes = card.notes ? card.notes.toLowerCase().includes(query) : false;
        const matchesTags = card.tags.some(t => t.toLowerCase().includes(query));
        if (!matchesFront && !matchesBack && !matchesNotes && !matchesTags) {
          return false;
        }
      }

      // Deck filter
      if (selectedDeckId !== 'all' && card.deckId !== selectedDeckId) {
        return false;
      }

      // State filter
      if (selectedState !== 'all' && card.state !== selectedState) {
        return false;
      }

      // Star filter
      if (onlyFavorites && !card.isFavorite) {
        return false;
      }

      return true;
    });
  }, [cards, searchTerm, selectedDeckId, selectedState, onlyFavorites]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24 space-y-4">
      
      {/* Top Search & Filter Bar */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 space-y-3 shadow-lg">
        
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search questions, answers, tags, code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          {/* Deck select */}
          <select
            value={selectedDeckId}
            onChange={(e) => setSelectedDeckId(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Decks ({cards.length})</option>
            {decks.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} ({cards.filter(c => c.deckId === d.id).length})
              </option>
            ))}
          </select>

          {/* State select */}
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All SRS States</option>
            <option value="new">New</option>
            <option value="learning">Learning</option>
            <option value="review">Review</option>
            <option value="relearning">Relearning</option>
            <option value="suspended">Suspended</option>
          </select>

          {/* Favorites filter button */}
          <button
            type="button"
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
              onlyFavorites
                ? 'bg-amber-950/50 border-amber-500/50 text-amber-300'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>Favorites</span>
          </button>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between gap-2 px-1">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Found {filteredCards.length} {filteredCards.length === 1 ? 'card' : 'cards'}
        </span>

        <button
          onClick={onOpenAddCard}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Card</span>
        </button>
      </div>

      {/* Cards List */}
      <div className="space-y-2.5">
        {filteredCards.length === 0 ? (
          <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
            <Search className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-sm font-semibold text-slate-300">No flashcards found</p>
            <p className="text-xs text-slate-500">Try adjusting your filters or search keywords</p>
          </div>
        ) : (
          filteredCards.map((card) => {
            const deck = deckMap.get(card.deckId);
            const badge = getCardBadgeColor(card.state);

            return (
              <div
                key={card.id}
                className="bg-slate-800/70 hover:bg-slate-800 border border-slate-700/70 hover:border-slate-600 rounded-2xl p-3.5 space-y-2.5 transition-all shadow-sm group"
              >
                {/* Card Header (Deck, State Badge, Star) */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: deck?.color || '#6366F1' }}
                    />
                    <span className="text-[11px] font-bold text-slate-300 truncate">
                      {deck?.name || 'General Deck'}
                    </span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text}`}>
                      {badge.label}
                    </span>
                  </div>

                  <button
                    onClick={() => onToggleFavorite(card)}
                    className={`p-1 rounded-lg transition-colors ${
                      card.isFavorite ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${card.isFavorite ? 'fill-amber-400' : ''}`} />
                  </button>
                </div>

                {/* Card Front / Question */}
                <h4 className="text-sm font-bold text-white leading-snug">
                  {card.front}
                </h4>

                {/* Card Back preview */}
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {card.back}
                </p>

                {/* SRS Details & Action Bar */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-700/50 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span>Int: <b className="text-slate-200">{card.interval}d</b></span>
                    <span>&bull;</span>
                    <span>Ease: <b className="text-slate-200">{Math.round(card.easeFactor * 100)}%</b></span>
                    <span>&bull;</span>
                    <span>Reps: <b className="text-slate-200">{card.repetitions}</b></span>
                    {card.lapses > 0 && (
                      <>
                        <span>&bull;</span>
                        <span className="text-rose-400">Lapses: <b>{card.lapses}</b></span>
                      </>
                    )}
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onResetCardSRS(card)}
                      className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-amber-300 transition-colors"
                      title="Reset SRS Progress to New"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onToggleSuspend(card)}
                      className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-indigo-300 transition-colors"
                      title={card.state === 'suspended' ? 'Unsuspend Card' : 'Suspend Card'}
                    >
                      {card.state === 'suspended' ? (
                        <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <PauseCircle className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => onEditCard(card)}
                      className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                      title="Edit Card"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm('Delete this card permanently?')) {
                          onDeleteCard(card.id);
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete Card"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
