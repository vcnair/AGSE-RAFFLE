import React, { useState, useEffect, useRef, useMemo } from 'https://esm.sh/react@19.0.0';
import { Employee, RaffleHistoryEntry } from '../types';
import { Trophy, Sparkles, RefreshCcw } from 'https://esm.sh/lucide-react@0.460.0';
import confetti from 'https://esm.sh/canvas-confetti@1.9.3';
import { audioManager } from '../utils/audio';

interface RaffleStageProps {
  employees: Employee[];
  history: RaffleHistoryEntry[];
  onWinner: (winner: Employee) => void;
  isSpinning: boolean;
  setIsSpinning: (val: boolean) => void;
  isDone: boolean;
  setIsDone: (val: boolean) => void;
  onReset: () => void;
}

interface Particle {
  id: string;
  emp: Employee;
  x: number;
  y: number;
  vx: number;
  vy: number;
  scale: number;
  opacity: number;
  rotation: number;
  isVortex: boolean;
}

export const RaffleStage: React.FC<RaffleStageProps> = ({ 
  employees,
  history,
  onWinner, 
  isSpinning, 
  setIsSpinning,
  isDone,
  setIsDone,
  onReset
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [scrollOffset, setScrollOffset] = useState(0);
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Get list of eligible employees (those who haven't won yet)
  const eligibleEmployees = useMemo(() => {
    const winnerIds = new Set(history.map(entry => entry.winner.id));
    return employees.filter(emp => !winnerIds.has(emp.id));
  }, [employees, history]);

  const gridStats = useMemo(() => ({
    cols: 4, 
    rowSpacing: 35,
    get totalHeight() { return Math.ceil(employees.length / this.cols) * this.rowSpacing; }
  }), [employees.length]);

  const initParticles = () => {
    const initialParticles = employees.map((emp, i) => {
      const col = i % gridStats.cols;
      const row = Math.floor(i / gridStats.cols);
      return {
        id: `${emp.id}-${i}`,
        emp,
        x: (col * (100 / gridStats.cols)) + (100 / gridStats.cols / 2),
        y: row * gridStats.rowSpacing, 
        vx: 0,
        vy: 0,
        scale: 1,
        opacity: 0.9,
        rotation: 0,
        isVortex: false
      };
    });
    setParticles(initialParticles);
  };

  useEffect(() => {
    initParticles();
  }, [employees]);

  useEffect(() => {
    if (!isDone && !isSpinning) {
      initParticles();
      startTimeRef.current = 0;
      setScrollOffset(0);
    }
  }, [isDone, isSpinning]);

  const animate = (time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    if (isSpinning) {
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsed = time - startTimeRef.current;

      setParticles(prev => prev.map(p => {
        let { x, y, vx, vy, rotation, scale, opacity } = p;
        const dx = 50 - x;
        const dy = 50 - y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const speedMultiplier = Math.min(elapsed / 500, 15);
        const force = 0.03 * speedMultiplier;
        vx += (dx / dist) * force + (dy / dist) * force * 4;
        vy += (dy / dist) * force - (dx / dist) * force * 4;
        x += vx;
        y += vy;
        rotation += speedMultiplier * 10;
        scale = Math.max(0.6, scale * 0.995);
        vx *= 0.96;
        vy *= 0.96;
        return { ...p, x, y, vx, vy, rotation, scale, opacity, isVortex: true };
      }));
    } else if (!isDone) {
      setScrollOffset(prev => (prev + deltaTime * 0.015) % gridStats.totalHeight);
    }

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isSpinning, isDone, gridStats.totalHeight]);

  const startDraw = () => {
    if (isSpinning || eligibleEmployees.length === 0) return;
    setIsSpinning(true);
    setIsDone(false);
    startTimeRef.current = performance.now();
    const tickInterval = setInterval(() => audioManager.playTick(0.15), 100);
    setTimeout(() => {
      clearInterval(tickInterval);
      const winner = eligibleEmployees[Math.floor(Math.random() * eligibleEmployees.length)];
      setIsSpinning(false);
      setIsDone(true);
      onWinner(winner);
      audioManager.playWin();
      confetti({ 
        particleCount: 400, 
        spread: 120, 
        origin: { y: 0.5 }, 
        colors: ['#fbbf24', '#ffffff', '#d97706'],
        gravity: 0.7,
        scalar: 1.5
      });
    }, 6000);
  };

  return (
    <div className="fixed inset-0 z-0 bg-[#020617] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#0f172a_0%,_#020617_90%)] opacity-80"></div>
      
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => {
          let displayY = p.isVortex ? p.y : (p.y - scrollOffset);
          if (!p.isVortex) {
            while (displayY < -50) displayY += gridStats.totalHeight;
            while (displayY > gridStats.totalHeight - 50) displayY -= gridStats.totalHeight;
          }
          if (!p.isVortex && (displayY < -20 || displayY > 120)) return null;

          return (
            <div key={p.id} className="absolute whitespace-nowrap antialiased"
              style={{
                left: `${p.x}%`, top: `${displayY}%`,
                transform: `translate3d(-50%, -50%, 0) scale(${p.scale}) rotate(${p.rotation}deg)`,
                opacity: p.isVortex ? p.opacity : (displayY < 5 || displayY > 95 ? 0 : p.opacity * 0.8),
                color: isSpinning ? '#fbbf24' : '#ffffff',
                fontSize: isSpinning ? '28px' : '24px', 
                fontWeight: '900',
                filter: isSpinning ? 'drop-shadow(0 0 15px #d97706)' : 'drop-shadow(0 10px 20px rgba(0,0,0,1))',
                textTransform: 'uppercase', 
                letterSpacing: '0.2em',
              }}>
              {p.emp.firstName} {p.emp.lastName}
            </div>
          );
        })}
      </div>

      <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="pointer-events-auto flex flex-col items-center">
          {!isSpinning && !isDone && (
            <div className="flex flex-col items-center gap-8 animate-in fade-in zoom-in-95 duration-1000">
              {eligibleEmployees.length > 0 ? (
                <button 
                  onClick={startDraw} 
                  className="group relative px-24 py-12 lg:px-32 lg:py-16 bg-gradient-to-br from-amber-400 via-amber-600 to-amber-900 rounded-[3rem] text-white font-black text-5xl lg:text-7xl uppercase tracking-[0.2em] shadow-[0_40px_100px_rgba(217,119,6,0.4)] border-t-4 border-amber-300/40 transform transition-all hover:scale-105 active:scale-95"
                >
                  <div className="flex items-center gap-10">
                    <Trophy size={80} className="text-white drop-shadow-lg animate-bounce" />
                    <span>Draw</span>
                  </div>
                </button>
              ) : (
                <div className="flex flex-col items-center gap-6">
                  <div className="px-16 py-8 bg-slate-950/80 backdrop-blur-md rounded-[2.5rem] border-2 border-amber-500/30">
                    <div className="text-amber-500 font-black text-4xl lg:text-6xl uppercase tracking-[0.3em] text-center">All Employees</div>
                    <div className="text-amber-500 font-black text-4xl lg:text-6xl uppercase tracking-[0.3em] text-center">Have Won!</div>
                  </div>
                  <div className="text-white/60 font-semibold text-xl text-center max-w-md">
                    Clear the history to start a new round
                  </div>
                </div>
              )}
            </div>
          )}

          {isSpinning && (
            <div className="flex flex-col items-center gap-16">
              <div className="relative">
                 <div className="absolute inset-0 bg-amber-500 blur-[150px] opacity-100 animate-pulse"></div>
                 <Sparkles size={180} className="text-amber-500 animate-[spin_3s_linear_infinite] drop-shadow-[0_0_50px_rgba(217,119,6,0.8)]" />
              </div>
              <div className="text-amber-400 font-black text-7xl lg:text-9xl tracking-[0.6em] uppercase drop-shadow-[0_0_40px_#d97706] text-center pl-10">PICKING</div>
            </div>
          )}

          {isDone && !isSpinning && (
            <div className="flex flex-col items-center gap-10 animate-in fade-in slide-in-from-top-12 duration-500">
              <div className="text-white font-black text-4xl uppercase tracking-[0.5em] bg-slate-950/80 px-16 py-8 rounded-[2.5rem] border-2 border-amber-500/30 backdrop-blur-3xl shadow-2xl">WINNER FOUND</div>
              <button 
                onClick={onReset} 
                className="group flex items-center gap-8 px-20 py-10 bg-white/10 hover:bg-white/20 text-white font-black text-3xl rounded-[2.5rem] border border-white/20 transition-all uppercase tracking-widest active:scale-95 shadow-2xl backdrop-blur-xl"
              >
                <RefreshCcw size={48} className="group-hover:rotate-180 transition-transform duration-700" />
                <span>Reset Stage</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0%,_#020617_100%)] opacity-40"></div>
    </div>
  );
};