import { 
  FolderKanban, 
  Sparkles, 
  PlusCircle, 
  Search, 
  BarChart3 
} from 'lucide-react';

interface BottomNavigationProps {
  currentTab: 'decks' | 'study' | 'add' | 'browser' | 'stats';
  onTabChange: (tab: 'decks' | 'study' | 'add' | 'browser' | 'stats') => void;
  dueCount: number;
}

export function BottomNavigation({ currentTab, onTabChange, dueCount }: BottomNavigationProps) {
  const tabs = [
    { id: 'decks' as const, label: 'Decks', icon: FolderKanban },
    { 
      id: 'study' as const, 
      label: 'Study', 
      icon: Sparkles,
      badge: dueCount > 0 ? dueCount : undefined
    },
    { id: 'add' as const, label: 'Add Card', icon: PlusCircle },
    { id: 'browser' as const, label: 'Cards', icon: Search },
    { id: 'stats' as const, label: 'Stats', icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 transition-all">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all select-none min-h-[50px] ${
                isActive
                  ? 'text-indigo-400 bg-indigo-950/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-extrabold flex items-center justify-center shadow-md animate-bounce">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight leading-none">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0.5 w-5 h-0.5 rounded-full bg-indigo-500" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
