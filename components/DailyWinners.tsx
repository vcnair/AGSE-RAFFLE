import React, { useMemo } from 'https://esm.sh/react@19.0.0';
import { RaffleHistoryEntry } from '../types';
import { ArrowLeft, Trophy, ShieldCheck, Zap } from 'https://esm.sh/lucide-react';

interface DailyWinnersProps {
  winners: RaffleHistoryEntry[];
  onBack: () => void;
  onClear: () => void;
}

export const DailyWinners: React.FC<DailyWinnersProps> = ({ winners, onBack, onClear }) => {
  const layoutConfig = useMemo(() => {
    const count = winners.length;
    if (count <= 1) return { grid: 'grid-cols-1', text: 'text-7xl lg:text-[12rem]', subText: 'text-3xl' };
    if (count <= 4) return { grid: 'grid-cols-2', text: 'text-5xl lg:text-7xl', subText: 'text-xl' };
    if (count <= 9) return { grid: 'grid-cols-3', text: 'text-3xl lg:text-5xl', subText: 'text-lg' };
    return { grid: 'grid-cols-3 lg:grid-cols-4', text: 'text-2xl lg:text-3xl', subText: 'text-sm' };
  }, [winners.length]);

  return (
    <div className="h-screen w-screen bg-[#020617] text-white flex flex-col overflow-hidden animate-in fade-in duration-500">
      <header className="px-8 py-6 lg:px-12 lg:py-8 flex items-center justify-between flex-shrink-0 bg-slate-950/50 backdrop-blur-md border-b border-white/5 z-20">
        <div className="flex items-center gap-6 lg:gap-10">
          <button 
            onClick={onBack}
            className="p-3 lg:p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group border border-white/10"
          >
            <ArrowLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter leading-none">
              Daily <span className="text-amber-500">Winners</span>
            </h1>
            <p className="text-amber-500/40 text-[10px] font-black uppercase tracking-[0.4em] mt-2">
              Hall of Fame • {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="bg-amber-600/10 border border-amber-500/20 px-5 py-2 lg:px-8 lg:py-4 rounded-2xl flex items-center gap-4">
             <div className="flex flex-col items-end">
               <span className="text-amber-500/40 text-[9px] font-black uppercase tracking-widest">Total Draws</span>
               <span className="text-amber-500 font-black text-2xl lg:text-3xl leading-none">{winners.length}</span>
             </div>
             <Trophy size={32} className="text-amber-500 opacity-50" />
           </div>
        </div>
      </header>

      <main className="flex-1 p-6 lg:p-10 relative bg-[radial-gradient(circle_at_center,_#0f172a_0%,_#020617_100%)] overflow-hidden">
        {winners.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-8 opacity-10">
            <Trophy size={160} />
            <p className="text-5xl font-black uppercase tracking-[0.5em]">No Records Found</p>
          </div>
        ) : (
          <div className={`h-full grid ${layoutConfig.grid} gap-4 lg:gap-6`}>
            {winners.map((entry, idx) => (
              <div 
                key={`${entry.winner.id}-${idx}`}
                className="group relative flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 hover:border-amber-500/40 transition-all duration-500 animate-in zoom-in-95"
              >
                <div className="absolute top-6 left-6 w-10 h-10 bg-amber-600/20 rounded-xl flex items-center justify-center text-amber-500 font-black text-sm border border-amber-500/20">
                  #{winners.length - idx}
                </div>

                <div className="flex flex-col items-center text-center w-full">
                  <h2 className={`${layoutConfig.text} font-black leading-[0.9] tracking-tighter mb-4 flex flex-col`}>
                    <span className="text-white uppercase truncate px-2">{entry.winner.firstName}</span>
                    <span className="text-amber-500 uppercase truncate px-2">{entry.winner.lastName}</span>
                  </h2>
                  
                  <div className={`flex flex-col items-center gap-2 ${layoutConfig.subText} text-slate-400 font-black uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity`}>
                    <div className="flex items-center gap-3">
                      <ShieldCheck size={18} className="text-amber-600" />
                      <span className="truncate max-w-[250px]">{entry.winner.jobTitle}</span>
                    </div>
                    <div className="text-[10px] lg:text-xs text-amber-600/50 tracking-[0.3em]">
                      {entry.winner.clientName}
                    </div>
                  </div>
                </div>
                
                <div className="absolute bottom-6 right-8 text-slate-600 font-mono text-xs font-bold uppercase tracking-widest group-hover:text-amber-500/40 transition-colors">
                  {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>

                <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/5 rounded-[2rem] transition-colors duration-500 pointer-events-none"></div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="px-8 py-8 bg-slate-950/80 border-t border-white/5 backdrop-blur-xl flex justify-center items-center gap-6 flex-shrink-0 z-20">
        <button 
          onClick={onBack}
          className="group flex items-center gap-4 px-12 py-5 bg-gradient-to-br from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-white font-black text-lg uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-95 shadow-[0_10px_40px_rgba(217,119,6,0.2)]"
        >
          <Zap size={24} className="fill-white" />
          <span>New Raffle Draw</span>
        </button>
      </footer>
    </div>
  );
};