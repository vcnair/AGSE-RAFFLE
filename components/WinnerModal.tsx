import React from 'https://esm.sh/react@19.0.0';
import { Employee } from '../types';
import { Trophy, X, Star, History, Zap, ShieldCheck } from 'https://esm.sh/lucide-react';

interface WinnerModalProps {
  winner: Employee | null;
  onClose: (shouldScrollToHistory?: boolean) => void;
  onNewDraw: () => void;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({ winner, onClose, onNewDraw }) => {
  if (!winner) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/98 backdrop-blur-xl animate-in fade-in duration-500 overflow-hidden">
      
      {/* Light Array Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,_transparent_0deg,_rgba(251,191,36,0.1)_15deg,_transparent_30deg)] animate-[spin_40s_linear_infinite]"></div>
      </div>

      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-500">
        
        {/* Award Emblem */}
        <div className="mb-6 flex justify-center items-center gap-6 flex-shrink-0">
           <Star size={24} className="text-amber-500 animate-pulse hidden sm:block" />
           <div className="relative">
              <div className="absolute inset-0 bg-amber-500 blur-[60px] opacity-30 animate-pulse"></div>
              <div className="relative p-6 bg-gradient-to-b from-amber-400 via-amber-600 to-amber-900 rounded-full shadow-2xl border-4 border-amber-200/20">
                 <Trophy size={60} className="text-white drop-shadow-xl" />
              </div>
           </div>
           <Star size={24} className="text-amber-500 animate-pulse delay-500 hidden sm:block" />
        </div>

        <div className="space-y-4 w-full">
          <div className="text-amber-500 font-black tracking-[0.8em] text-sm lg:text-base uppercase animate-pulse flex-shrink-0">
            Official Winner
          </div>
          
          <div className="flex flex-col items-center flex-shrink min-h-0">
            <h2 className="text-5xl lg:text-7xl font-black text-white leading-tight tracking-tighter drop-shadow-2xl overflow-hidden text-ellipsis w-full">
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-50 to-amber-500">
                {winner.firstName}
              </span>
            </h2>
            <h2 className="text-5xl lg:text-7xl font-black leading-tight tracking-tighter drop-shadow-2xl -mt-2 overflow-hidden text-ellipsis w-full">
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-amber-400 via-amber-600 to-amber-900">
                {winner.lastName}
              </span>
            </h2>
          </div>

          <div className="pt-6 flex-shrink-0">
            <div className="inline-block px-8 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
              <div className="text-amber-400 font-black text-xl lg:text-2xl tracking-widest uppercase mb-1">
                {winner.jobTitle}
              </div>
              <div className="flex items-center justify-center gap-3 text-slate-400 font-bold text-xs uppercase opacity-70">
                <ShieldCheck size={14} className="text-amber-500" />
                <span>{winner.clientName}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-row items-center justify-center gap-4 flex-shrink-0">
          <button 
            onClick={onNewDraw}
            className="group relative px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white font-black text-sm rounded-xl transition-all border-t border-amber-300 shadow-xl uppercase tracking-widest flex items-center gap-3 active:scale-95 pointer-events-auto"
          >
            <Zap size={18} className="fill-white" />
            <span>New Draw</span>
          </button>

          <button 
            onClick={() => onClose(true)}
            className="group px-8 py-4 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-black text-sm rounded-xl transition-all border border-white/10 uppercase tracking-widest flex items-center gap-3 active:scale-95 pointer-events-auto"
          >
            <History size={18} />
            <span>Archive</span>
          </button>
        </div>

        <button 
          onClick={() => onClose(false)}
          className="absolute top-0 right-0 p-4 text-white/30 hover:text-white transition-all flex items-center gap-2 text-xs font-bold pointer-events-auto"
        >
          <span className="hidden sm:inline uppercase tracking-widest">Close</span>
          <X size={24} />
        </button>
      </div>
    </div>
  );
};