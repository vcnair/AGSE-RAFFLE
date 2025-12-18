import React, { useState, useMemo, useEffect } from 'react';
import { parseEmployeeCSV } from './utils/csvParser.ts';
import { RAW_CSV_DATA } from './constants.ts';
import { Employee, RaffleHistoryEntry } from './types.ts';
import { RaffleStage } from './components/RaffleStage.tsx';
import { WinnerModal } from './components/WinnerModal.tsx';
import { DailyWinners } from './components/DailyWinners.tsx';
import { LayoutDashboard, Trash2, Star } from 'lucide-react';

const HISTORY_STORAGE_KEY = 'agse_raffle_generator_v6_history';

const App: React.FC = () => {
  const employees = useMemo(() => parseEmployeeCSV(RAW_CSV_DATA), []);
  const [history, setHistory] = useState<RaffleHistoryEntry[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [currentWinner, setCurrentWinner] = useState<Employee | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [view, setView] = useState<'stage' | 'daily'>('stage');

  // Load history from local storage
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const formatted = parsed.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
        setHistory(formatted);
      } catch (e) {
        console.error("History recovery failed:", e);
      }
    }
  }, []);

  // Save history locally
  useEffect(() => {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const handleWinner = (winner: Employee) => {
    setCurrentWinner(winner);
    const newEntry = { winner, timestamp: new Date() };
    setHistory(prev => [newEntry, ...prev]);
    
    setTimeout(() => {
      setShowWinnerModal(true);
      setIsDone(true);
    }, 800);
  };

  const resetStage = () => {
    setIsDone(false);
    setIsSpinning(false);
    setCurrentWinner(null);
    setShowWinnerModal(false);
    setView('stage');
  };

  const closeWinner = (shouldScrollToHistory = false) => {
    setShowWinnerModal(false);
    if (shouldScrollToHistory) {
      setView('daily');
    }
  };

  const clearHistory = () => {
    if (window.confirm("Permanently wipe all winners from history?")) {
      setHistory([]);
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    }
  };

  const todayWinners = useMemo(() => {
    const today = new Date().toDateString();
    return history.filter(entry => entry.timestamp.toDateString() === today);
  }, [history]);

  if (view === 'daily') {
    return (
      <DailyWinners 
        winners={todayWinners} 
        onBack={() => setView('stage')} 
        onClear={clearHistory}
      />
    );
  }

  return (
    <div className="h-screen w-screen bg-[#020617] text-slate-200 flex flex-col selection:bg-amber-500 selection:text-black font-sans overflow-hidden">
      
      {/* Background Raffle Stage - Full Page Area */}
      <RaffleStage 
        employees={employees} 
        onWinner={handleWinner} 
        isSpinning={isSpinning}
        setIsSpinning={setIsSpinning}
        isDone={isDone}
        setIsDone={setIsDone}
        onReset={resetStage}
      />

      {/* Foreground Interface Content */}
      <div className="relative z-50 flex flex-col h-full pointer-events-none">
        
        {/* Header with Centered Title */}
        <header className="w-full px-12 py-10 flex items-start justify-between">
           {/* Left Stat */}
           <div className="flex flex-col items-start bg-slate-950/40 backdrop-blur-md p-4 rounded-2xl border border-white/5 pointer-events-auto">
              <span className="text-amber-500/40 text-[10px] uppercase font-black tracking-widest mb-1">Employee Pool</span>
              <div className="text-amber-500 font-mono font-black text-2xl leading-none">{employees.length}</div>
           </div>

           {/* Centered Large Title */}
           <div className="absolute left-1/2 -translate-x-1/2 top-8 flex flex-col items-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full scale-150 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <h1 className="relative text-6xl lg:text-8xl font-black text-white tracking-tighter uppercase leading-none text-center drop-shadow-2xl">
                  AGSE <span className="text-transparent bg-clip-text bg-gradient-to-br from-amber-400 via-amber-600 to-amber-900">Raffle</span>
                </h1>
              </div>
              <div className="mt-4 px-6 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full backdrop-blur-md">
                <p className="text-amber-500 font-black text-xs uppercase tracking-[0.8em]">Secure Draw Engine</p>
              </div>
           </div>

           {/* Right Stat */}
           <div className="flex flex-col items-end bg-slate-950/40 backdrop-blur-md p-4 rounded-2xl border border-white/5 pointer-events-auto">
              <span className="text-amber-500/40 text-[10px] uppercase font-black tracking-widest mb-1">Today's Winners</span>
              <div className="text-white font-mono font-black text-2xl leading-none">{todayWinners.length}</div>
           </div>
        </header>

        {/* Empty space for middle */}
        <div className="flex-1" />

        {/* Footer Navigation */}
        <footer className="w-full px-12 py-12 flex items-center justify-between">
          <button 
            onClick={clearHistory}
            className="p-5 text-slate-700 hover:text-red-500 transition-all pointer-events-auto bg-slate-950/40 backdrop-blur-md rounded-2xl border border-white/5 active:scale-95"
            title="Wipe Local History"
          >
            <Trash2 size={24} />
          </button>

          <button 
            onClick={() => setView('daily')}
            className="group pointer-events-auto flex items-center gap-6 px-14 py-6 bg-slate-950/60 hover:bg-amber-600 text-amber-500 hover:text-white font-black text-lg uppercase tracking-[0.3em] rounded-3xl border border-amber-600/30 transition-all active:scale-95 shadow-2xl shadow-amber-950/20"
          >
            <Star size={24} className="group-hover:fill-white transition-all" />
            <span>Hall of Fame</span>
          </button>
          
          <div className="w-16 h-16 bg-slate-950/40 backdrop-blur-md rounded-2xl border border-white/5 flex items-center justify-center pointer-events-auto opacity-40">
            <LayoutDashboard size={24} className="text-amber-500" />
          </div>
        </footer>
      </div>

      <WinnerModal 
        winner={currentWinner} 
        onClose={closeWinner} 
        onNewDraw={resetStage}
      />
    </div>
  );
};

export default App;