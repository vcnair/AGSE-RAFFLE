
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Employee } from '../types';
import { Trophy, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import confetti from 'https://cdn.skypack.dev/canvas-confetti';
import { audioManager } from '../utils/audio';

interface RaffleWheelProps {
  employees: Employee[];
  onWinner: (winner: Employee) => void;
  isSpinning: boolean;
  setIsSpinning: (val: boolean) => void;
}

const ITEM_WIDTH = 220;

export const RaffleWheel: React.FC<RaffleWheelProps> = ({ 
  employees, 
  onWinner, 
  isSpinning, 
  setIsSpinning 
}) => {
  const [wheelItems, setWheelItems] = useState<Employee[]>([]);
  const [offset, setOffset] = useState(0);
  const [transition, setTransition] = useState('none');
  const [isPreparing, setIsPreparing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTickRef = useRef<number>(-1);

  // Initialize and shuffle
  useEffect(() => {
    if (employees.length === 0) return;
    const items: Employee[] = [];
    // Increase pool for longer visual movement
    for (let i = 0; i < 15; i++) {
      items.push(...[...employees].sort(() => Math.random() - 0.5));
    }
    setWheelItems(items);
  }, [employees]);

  // Track position for sound ticks
  useEffect(() => {
    if (!isSpinning) return;

    let animationFrame: number;
    const checkTick = () => {
      if (containerRef.current) {
        // Calculate which index is currently in the middle
        const rect = containerRef.current.getBoundingClientRect();
        const containerMid = window.innerWidth / 2; // Approximate center
        const currentTranslation = new WebKitCSSMatrix(window.getComputedStyle(containerRef.current).transform).m41;
        
        // Logical index passing the center point
        const currentIndex = Math.floor(Math.abs(currentTranslation) / ITEM_WIDTH);
        
        if (currentIndex !== lastTickRef.current) {
          audioManager.playTick(0.05);
          lastTickRef.current = currentIndex;
        }
      }
      animationFrame = requestAnimationFrame(checkTick);
    };

    animationFrame = requestAnimationFrame(checkTick);
    return () => cancelAnimationFrame(animationFrame);
  }, [isSpinning]);

  const spin = useCallback(() => {
    if (isSpinning || isPreparing || wheelItems.length === 0) return;
    
    setIsPreparing(true);
    
    // 1. "Shuffling" phase - Jitter the ribbon to show activity
    setTransition('transform 0.5s ease-in-out');
    setOffset(100); // Pull back slightly
    
    setTimeout(() => {
      setIsPreparing(false);
      setIsSpinning(true);
      
      const minIndex = 80;
      const maxIndex = wheelItems.length - 20;
      const targetIndex = Math.floor(Math.random() * (maxIndex - minIndex)) + minIndex;
      const winner = wheelItems[targetIndex];

      const containerWidth = window.innerWidth;
      const centerPoint = containerWidth / 2;
      const jitter = (Math.random() - 0.5) * (ITEM_WIDTH * 0.6);
      const finalOffset = targetIndex * ITEM_WIDTH - centerPoint + (ITEM_WIDTH / 2) + jitter;

      setTransition('transform 7s cubic-bezier(0.1, 0, 0.05, 1)');
      setOffset(-finalOffset);

      // Handle completion
      setTimeout(() => {
        setIsSpinning(false);
        onWinner(winner);
        audioManager.playWin();
        
        confetti({
          particleCount: 200,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#f59e0b', '#10b981', '#ffffff']
        });
      }, 7000);
    }, 800);

  }, [isSpinning, isPreparing, wheelItems, onWinner, setIsSpinning]);

  return (
    <div className="flex flex-col items-center w-full space-y-8">
      {/* Ribbon Container */}
      <div className={`relative w-full h-56 bg-slate-950/40 border-y border-slate-800 backdrop-blur-xl overflow-hidden shadow-[inset_0_0_120px_rgba(0,0,0,0.7)] transition-all duration-500 ${isSpinning ? 'scale-[1.02] border-blue-500/30' : ''}`}>
        
        {/* Indicators */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
          <ChevronDown size={40} strokeWidth={3} className={isSpinning ? 'animate-pulse' : ''} />
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30 text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
          <ChevronUp size={40} strokeWidth={3} className={isSpinning ? 'animate-pulse' : ''} />
        </div>
        
        {/* Center Target Zone */}
        <div className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-gradient-to-b from-transparent via-blue-500 to-transparent z-20 opacity-50"></div>
        <div className={`absolute inset-y-8 left-1/2 w-48 -translate-x-1/2 border-x border-blue-500/20 z-10 bg-blue-500/5 transition-opacity duration-500 ${isSpinning ? 'opacity-100' : 'opacity-0'}`}></div>

        {/* The Moving Ribbon */}
        <div 
          ref={containerRef}
          className={`flex items-center h-full ${isPreparing ? 'animate-bounce' : ''}`}
          style={{
            transform: `translateX(${offset}px)`,
            transition: transition,
            width: `${wheelItems.length * ITEM_WIDTH}px`
          }}
        >
          {wheelItems.map((emp, idx) => (
            <div 
              key={`${emp.id}-${idx}`}
              className="flex-shrink-0 flex flex-col items-center justify-center p-4"
              style={{ width: `${ITEM_WIDTH}px` }}
            >
              <div className={`
                w-44 h-32 rounded-2xl border flex flex-col items-center justify-center text-center p-4 transition-all duration-300
                ${isSpinning ? 'bg-slate-900/80 border-slate-700/50 scale-95 blur-[0.5px]' : 'bg-slate-800 border-slate-700 shadow-xl'}
                group-hover:border-blue-500
              `}>
                <div className="text-[10px] uppercase tracking-[0.2em] text-blue-400 font-black mb-2 opacity-70">
                  {emp.clientName.split(' ')[0]}
                </div>
                <div className="text-base font-black text-white leading-tight mb-2 drop-shadow-sm">
                  {emp.firstName}<br/>{emp.lastName}
                </div>
                <div className="text-[10px] text-slate-500 font-medium truncate w-full italic">
                  {emp.jobTitle}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cinematic Side Masks */}
        <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-[#020617] via-[#020617]/80 to-transparent z-20 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-[#020617] via-[#020617]/80 to-transparent z-20 pointer-events-none"></div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={spin}
          disabled={isSpinning || isPreparing || employees.length === 0}
          className={`
            group relative px-16 py-6 rounded-2xl font-black text-2xl tracking-tighter uppercase overflow-hidden transition-all active:scale-95
            ${(isSpinning || isPreparing) 
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700' 
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:shadow-[0_20px_50px_rgba(37,99,235,0.5)] border-t border-blue-400'}
          `}
        >
          <div className="relative z-10 flex items-center gap-4">
            {(isSpinning || isPreparing) ? (
              <Zap size={28} className="animate-spin text-blue-400" />
            ) : (
              <Trophy size={28} className="group-hover:rotate-12 transition-transform" />
            )}
            <span>{isSpinning ? 'Calculating...' : isPreparing ? 'Shuffling...' : 'Initiate Draw'}</span>
          </div>
          
          {/* Animated background flare */}
          <div className="absolute top-0 -left-[100%] group-hover:left-[100%] transition-all duration-700 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
        </button>
        
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest opacity-50">
          Mechanical Seed: {Math.random().toString(36).substring(7).toUpperCase()}
        </p>
      </div>
    </div>
  );
};
