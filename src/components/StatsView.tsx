import { useMemo } from 'react';
import { 
  Flame, 
  CheckCircle2, 
  Calendar, 
  TrendingUp, 
  BarChart2, 
  Clock, 
  Layers, 
  Award,
  Sparkles
} from 'lucide-react';
import { Card, Deck, UserProfile } from '../types';

interface StatsViewProps {
  cards: Card[];
  decks: Deck[];
  profile: UserProfile | null;
}

export function StatsView({ cards, decks, profile }: StatsViewProps) {
  const now = Date.now();

  // Metrics computation
  const stats = useMemo(() => {
    const total = cards.length;
    const newCount = cards.filter(c => c.state === 'new').length;
    const learnCount = cards.filter(c => c.state === 'learning' || c.state === 'relearning').length;
    const youngCount = cards.filter(c => c.state === 'review' && c.interval > 0 && c.interval < 21).length;
    const matureCount = cards.filter(c => c.state === 'review' && c.interval >= 21).length;
    const suspendedCount = cards.filter(c => c.state === 'suspended').length;

    const totalReps = cards.reduce((acc, c) => acc + (c.repetitions || 0), 0);
    const totalLapses = cards.reduce((acc, c) => acc + (c.lapses || 0), 0);
    const retentionRate = totalReps > 0 ? Math.round((1 - (totalLapses / (totalReps + totalLapses))) * 100) : 95;

    const avgEase = cards.length > 0 
      ? Math.round((cards.reduce((acc, c) => acc + (c.easeFactor || 2.5), 0) / cards.length) * 100)
      : 250;

    // Due forecast
    const dueToday = cards.filter(c => c.state === 'new' || c.due <= now).length;
    const dueTomorrow = cards.filter(c => c.due > now && c.due <= now + 86400000).length;
    const dueIn3d = cards.filter(c => c.due > now + 86400000 && c.due <= now + 3 * 86400000).length;
    const dueIn7d = cards.filter(c => c.due > now + 3 * 86400000 && c.due <= now + 7 * 86400000).length;
    const dueIn30d = cards.filter(c => c.due > now + 7 * 86400000 && c.due <= now + 30 * 86400000).length;

    return {
      total,
      newCount,
      learnCount,
      youngCount,
      matureCount,
      suspendedCount,
      totalReps,
      totalLapses,
      retentionRate,
      avgEase,
      forecast: {
        today: dueToday,
        tomorrow: dueTomorrow,
        in3d: dueIn3d,
        in7d: dueIn7d,
        in30d: dueIn30d
      }
    };
  }, [cards, now]);

  // Generate 28-day simulated activity heatmap
  const heatmapDays = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const isToday = i === 0;
      // Simulated review activity intensity
      const level = isToday ? 3 : (i % 3 === 0 ? 2 : (i % 5 === 0 ? 0 : 1));
      days.push({
        date: d.toISOString().split('T')[0],
        dayOfWeek: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        level
      });
    }
    return days;
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24 space-y-4">
      
      {/* Top Streak & Retention Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 text-center shadow-md">
          <div className="flex items-center justify-center gap-1 text-xs font-bold text-amber-400 uppercase tracking-wide mb-1">
            <Flame className="w-3.5 h-3.5 fill-amber-400" />
            <span>Streak</span>
          </div>
          <div className="text-2xl font-black text-white">{profile?.streak || 1} <span className="text-sm font-semibold text-slate-400">days</span></div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 text-center shadow-md">
          <div className="flex items-center justify-center gap-1 text-xs font-bold text-emerald-400 uppercase tracking-wide mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Retention</span>
          </div>
          <div className="text-2xl font-black text-white">{stats.retentionRate}%</div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 text-center shadow-md">
          <div className="flex items-center justify-center gap-1 text-xs font-bold text-indigo-400 uppercase tracking-wide mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Avg Ease</span>
          </div>
          <div className="text-2xl font-black text-white">{stats.avgEase}%</div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 text-center shadow-md">
          <div className="flex items-center justify-center gap-1 text-xs font-bold text-purple-400 uppercase tracking-wide mb-1">
            <Award className="w-3.5 h-3.5" />
            <span>Total Cards</span>
          </div>
          <div className="text-2xl font-black text-white">{stats.total}</div>
        </div>
      </div>

      {/* Card Maturity Distribution (Anki Style) */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-indigo-400" />
          <span>Card Maturity Breakdown</span>
        </h3>

        {/* Stacked Progress Bar */}
        <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden flex shadow-inner">
          {stats.total > 0 && (
            <>
              <div 
                style={{ width: `${(stats.newCount / stats.total) * 100}%` }} 
                className="bg-blue-500 transition-all"
                title={`New: ${stats.newCount}`}
              />
              <div 
                style={{ width: `${(stats.learnCount / stats.total) * 100}%` }} 
                className="bg-amber-500 transition-all"
                title={`Learning: ${stats.learnCount}`}
              />
              <div 
                style={{ width: `${(stats.youngCount / stats.total) * 100}%` }} 
                className="bg-emerald-500 transition-all"
                title={`Young Review: ${stats.youngCount}`}
              />
              <div 
                style={{ width: `${(stats.matureCount / stats.total) * 100}%` }} 
                className="bg-emerald-300 transition-all"
                title={`Mature Review: ${stats.matureCount}`}
              />
              <div 
                style={{ width: `${(stats.suspendedCount / stats.total) * 100}%` }} 
                className="bg-slate-600 transition-all"
                title={`Suspended: ${stats.suspendedCount}`}
              />
            </>
          )}
        </div>

        {/* Legend Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 text-xs">
          <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-xl">
            <span className="w-3 h-3 rounded bg-blue-500 shrink-0" />
            <div className="flex-1 flex justify-between">
              <span className="text-slate-400">New</span>
              <span className="font-bold text-white">{stats.newCount}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-xl">
            <span className="w-3 h-3 rounded bg-amber-500 shrink-0" />
            <div className="flex-1 flex justify-between">
              <span className="text-slate-400">Learning</span>
              <span className="font-bold text-white">{stats.learnCount}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-xl">
            <span className="w-3 h-3 rounded bg-emerald-500 shrink-0" />
            <div className="flex-1 flex justify-between">
              <span className="text-slate-400">Young (&lt;21d)</span>
              <span className="font-bold text-white">{stats.youngCount}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-xl">
            <span className="w-3 h-3 rounded bg-emerald-300 shrink-0" />
            <div className="flex-1 flex justify-between">
              <span className="text-slate-400">Mature (&ge;21d)</span>
              <span className="font-bold text-white">{stats.matureCount}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-xl">
            <span className="w-3 h-3 rounded bg-slate-600 shrink-0" />
            <div className="flex-1 flex justify-between">
              <span className="text-slate-400">Suspended</span>
              <span className="font-bold text-white">{stats.suspendedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Due Forecast Table */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          <span>Due Card Forecast</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
          <div className="bg-slate-900/80 border border-slate-700/50 p-2.5 rounded-xl">
            <div className="text-slate-400 font-semibold mb-0.5">Today</div>
            <div className="text-lg font-black text-white">{stats.forecast.today}</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-700/50 p-2.5 rounded-xl">
            <div className="text-slate-400 font-semibold mb-0.5">Tomorrow</div>
            <div className="text-lg font-black text-indigo-400">{stats.forecast.tomorrow}</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-700/50 p-2.5 rounded-xl">
            <div className="text-slate-400 font-semibold mb-0.5">In 3 Days</div>
            <div className="text-lg font-black text-indigo-400">{stats.forecast.in3d}</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-700/50 p-2.5 rounded-xl">
            <div className="text-slate-400 font-semibold mb-0.5">In 7 Days</div>
            <div className="text-lg font-black text-indigo-400">{stats.forecast.in7d}</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-700/50 p-2.5 rounded-xl col-span-2 sm:col-span-1">
            <div className="text-slate-400 font-semibold mb-0.5">In 30 Days</div>
            <div className="text-lg font-black text-indigo-400">{stats.forecast.in30d}</div>
          </div>
        </div>
      </div>

      {/* 28-Day Study Heatmap Grid */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>4-Week Activity Heatmap</span>
          </h3>
          <span className="text-[11px] text-slate-400">Past 28 days</span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {heatmapDays.map((d, idx) => {
            const colors = [
              'bg-slate-900 border-slate-800',
              'bg-emerald-950 border-emerald-800 text-emerald-300',
              'bg-emerald-700 border-emerald-600 text-emerald-100',
              'bg-emerald-500 border-emerald-400 text-slate-950 font-bold'
            ];
            return (
              <div
                key={idx}
                className={`h-8 rounded-lg border flex flex-col items-center justify-center text-[10px] select-none ${colors[d.level]}`}
                title={`${d.date}: ${d.level > 0 ? `${d.level * 15} reviews` : '0 reviews'}`}
              >
                <span>{d.date.split('-')[2]}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
