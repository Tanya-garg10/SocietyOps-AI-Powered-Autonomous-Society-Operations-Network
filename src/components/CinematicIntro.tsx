import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, Sparkles, Network, ArrowRight } from 'lucide-react';

interface CinematicIntroProps {
  onComplete: () => void;
}

const INITIALIZATION_STEPS = [
  'Connecting operational network...',
  'Initializing AI teammates (Triage, Intel, Dispatch, Verify)...',
  'Synchronizing incident intelligence & spatial conduits...',
  'Establishing Switch communication bridge...',
  'SocietyOps is ready.',
];

export const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [scene, setScene] = useState<1 | 2 | 3 | 4>(1);

  // Check reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  useEffect(() => {
    if (prefersReducedMotion) {
      onComplete();
      return;
    }

    // Scene progression
    const t1 = setTimeout(() => setScene(2), 600);
    const t2 = setTimeout(() => setScene(3), 1200);

    // Step cycle
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < INITIALIZATION_STEPS.length - 1) {
          return prev + 1;
        }
        clearInterval(stepInterval);
        setTimeout(() => {
          setScene(4);
          setTimeout(onComplete, 400);
        }, 500);
        return prev;
      });
    }, 450);

    // Escape listener to skip
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ') {
        onComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearInterval(stepInterval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onComplete, prefersReducedMotion]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#05070c] text-white overflow-hidden select-none"
      >
        {/* Ambient subtle glow backdrops */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-blue-600/10 via-indigo-600/15 to-violet-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute inset-0 bg-grid-pattern opacity-15 pointer-events-none" />

        {/* Skip button in top right */}
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={onComplete}
          className="absolute top-6 right-6 px-3.5 py-1.5 rounded-full text-xs font-mono text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center gap-1.5 z-20 backdrop-blur-md"
        >
          <span>Skip Intro</span>
          <span className="text-[10px] text-slate-500 bg-white/10 px-1 rounded">ESC</span>
        </motion.button>

        {/* Central Visual Network Constellation */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-lg px-6">
          {/* Animated Node Circle (Scene 1 & 2) */}
          <div className="relative w-36 h-36 flex items-center justify-center mb-8">
            {/* Outer spinning ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
              className="absolute inset-0 rounded-full border border-dashed border-indigo-500/30"
            />
            {/* Inner pulsing glow ring */}
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
              className="absolute inset-2 rounded-full border border-blue-400/40 bg-indigo-500/10 shadow-[0_0_40px_rgba(99,102,241,0.25)]"
            />

            {/* Orbiting agent node dots */}
            {[0, 60, 120, 180, 240, 300].map((deg, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 * i, duration: 0.4 }}
                className="absolute w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"
                style={{
                  top: `${50 - 45 * Math.sin((deg * Math.PI) / 180)}%`,
                  left: `${50 + 45 * Math.cos((deg * Math.PI) / 180)}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            ))}

            {/* Core Icon */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0, filter: 'blur(10px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-2xl shadow-indigo-500/40 border border-white/25 ring-4 ring-indigo-500/20"
            >
              <Building2 className="w-8 h-8 text-white drop-shadow-md" />
            </motion.div>
          </div>

          {/* Logo & Tagline (Scene 2) */}
          <motion.div
            initial={{ opacity: 0, y: 15, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-white">SocietyOps</h1>
              <span className="text-[10px] font-mono uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500/20 to-violet-500/20 text-blue-300 border border-blue-400/30">
                Switch OS
              </span>
            </div>
            <p className="text-sm font-medium text-slate-300 tracking-tight">
              Don't just report problems. <span className="text-blue-400">Resolve them together.</span>
            </p>
          </motion.div>

          {/* Sequence of initialization progress (Scene 3) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="mt-8 w-full max-w-sm space-y-3"
          >
            {/* Progress bar */}
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${((currentStepIndex + 1) / INITIALIZATION_STEPS.length) * 100}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-300 shadow-[0_0_12px_#38bdf8]"
              />
            </div>

            {/* Status text */}
            <div className="h-6 flex items-center justify-center gap-2 text-xs font-mono text-slate-400">
              <motion.span
                key={currentStepIndex}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1.5 text-slate-300"
              >
                <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" />
                <span>{INITIALIZATION_STEPS[currentStepIndex]}</span>
              </motion.span>
            </div>
          </motion.div>
        </div>

        {/* Bottom subtle copyright */}
        <div className="absolute bottom-6 text-[11px] font-mono text-slate-600">
          AUTONOMOUS MULTI-AGENT RESIDENTIAL FABRIC • V1.0.4
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
