import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Sparkles, Plus, Code, HelpCircle } from 'lucide-react';
import { Card, Deck } from '../types';

interface CardEditorModalProps {
  cardToEdit?: Card | null;
  decks: Deck[];
  defaultDeckId?: string;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: Card) => void;
  onDelete?: (cardId: string) => void;
}

export function CardEditorModal({
  cardToEdit,
  decks,
  defaultDeckId,
  userId,
  isOpen,
  onClose,
  onSave,
  onDelete
}: CardEditorModalProps) {
  const [deckId, setDeckId] = useState(defaultDeckId || decks[0]?.id || 'deck_dotnet');
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [spokenTip, setSpokenTip] = useState('');
  const [notes, setNotes] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<'Basic' | 'Intermediate' | 'Advanced' | 'Senior'>('Intermediate');

  useEffect(() => {
    if (cardToEdit) {
      setDeckId(cardToEdit.deckId);
      setFront(cardToEdit.front);
      setBack(cardToEdit.back);
      setSpokenTip(cardToEdit.spokenTip || '');
      setNotes(cardToEdit.notes || '');
      setTags(cardToEdit.tags || []);
      setDifficulty(cardToEdit.difficulty || 'Intermediate');
    } else {
      setDeckId(defaultDeckId || decks[0]?.id || 'deck_dotnet');
      setFront('');
      setBack('');
      setSpokenTip('');
      setNotes('');
      setTags(['Custom']);
      setDifficulty('Intermediate');
    }
  }, [cardToEdit, defaultDeckId, decks, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;

    const now = Date.now();
    const isoNow = new Date().toISOString();

    const savedCard: Card = {
      id: cardToEdit ? cardToEdit.id : `custom_card_${Date.now()}`,
      userId,
      deckId,
      front: front.trim(),
      back: back.trim(),
      spokenTip: spokenTip.trim() || undefined,
      notes: notes.trim() || undefined,
      tags,
      difficulty,
      state: cardToEdit ? cardToEdit.state : 'new',
      due: cardToEdit ? cardToEdit.due : now,
      interval: cardToEdit ? cardToEdit.interval : 0,
      easeFactor: cardToEdit ? cardToEdit.easeFactor : 2.5,
      repetitions: cardToEdit ? cardToEdit.repetitions : 0,
      lapses: cardToEdit ? cardToEdit.lapses : 0,
      isFavorite: cardToEdit ? cardToEdit.isFavorite : false,
      createdAt: cardToEdit ? cardToEdit.createdAt : isoNow,
      updatedAt: isoNow
    };

    onSave(savedCard);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-5 sm:p-6 shadow-2xl space-y-4 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>{cardToEdit ? 'Edit Flashcard' : 'Create New Flashcard'}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Deck & Difficulty selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Deck</label>
              <select
                value={deckId}
                onChange={(e) => setDeckId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-indigo-500"
              >
                {decks.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty Level</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Basic">Basic</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Senior">Senior / Architect</option>
              </select>
            </div>
          </div>

          {/* Front (Question) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Front / Question <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={2}
              placeholder="e.g. What is the difference between IEnumerable and IQueryable in EF Core?"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Back (Answer) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Back / Answer <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Key concepts, bullet points, and concise explanation..."
              value={back}
              onChange={(e) => setBack(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none font-sans"
            />
          </div>

          {/* Senior Verbal Opener Tip */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              🎙️ Senior Verbal Opener / Conversation Lead (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 'In production .NET systems, the primary distinction is in-memory vs server-side expression tree translation...'"
              value={spokenTip}
              onChange={(e) => setSpokenTip(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Code Snippet / Deep Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              💻 Code Example & Deep Technical Notes (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="C# / TypeScript snippet or architecture details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Tags</label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                placeholder="Add tag (e.g. C#, EFCore, Async)..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 bg-indigo-950/40 border border-indigo-800/40 text-indigo-300 text-[11px] font-medium px-2 py-0.5 rounded-lg"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-400"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
            {cardToEdit && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Delete this card permanently?')) {
                    onDelete(cardToEdit.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/40"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Card</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
