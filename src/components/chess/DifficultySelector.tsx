'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import { useGame } from '../../store/gameStore';
import { Difficulty } from '../../types/chess';

export const DifficultySelector: React.FC = () => {
  const { gameState, changeDifficulty } = useGame();
  const currentDifficulty = gameState.difficulty;

  const levels: {
    id: Difficulty;
    label: string;
    depth: number;
    color: string;
    textColor: string;
    icon: React.ComponentType<any>;
    desc: string;
  }[] = [
    {
      id: 'easy',
      label: 'Easy',
      depth: 5,
      color: 'bg-emerald-50 border-emerald-200 shadow-inner',
      textColor: 'text-emerald-700',
      icon: ShieldCheck,
      desc: 'Depth 5',
    },
    {
      id: 'medium',
      label: 'Medium',
      depth: 10,
      color: 'bg-amber-50 border-amber-200 shadow-inner',
      textColor: 'text-amber-700',
      icon: ShieldAlert,
      desc: 'Depth 10',
    },
    {
      id: 'hard',
      label: 'Hard',
      depth: 15,
      color: 'bg-red-50 border-red-200 shadow-inner',
      textColor: 'text-red-700',
      icon: ShieldX,
      desc: 'Depth 15',
    },
  ];

  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-wide text-slate-700 uppercase">
          AI OPPONENT DIFFICULTY
        </h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          STOCKFISH ENGINE
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 relative mt-1">
        {levels.map((lvl) => {
          const isActive = currentDifficulty === lvl.id;
          const Icon = lvl.icon;

          return (
            <button
              key={lvl.id}
              onClick={() => changeDifficulty(lvl.id)}
              disabled={gameState.isAiThinking}
              className={`group relative flex flex-col items-center justify-center rounded-xl border py-2.5 px-2 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                isActive
                  ? 'border-transparent'
                  : 'border-slate-200 bg-slate-50/50 text-slate-500 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700 shadow-sm'
              }`}
            >
              {/* Animated active pill */}
              {isActive && (
                <motion.div
                  layoutId="activeDifficulty"
                  className={`absolute inset-0 -z-10 rounded-xl border ${lvl.color}`}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                />
              )}

              <Icon
                className={`h-4.5 w-4.5 mb-1.5 transition-transform duration-300 group-hover:scale-110 ${
                  isActive ? lvl.textColor : 'text-slate-400'
                }`}
              />
              <span className={`text-xs font-bold tracking-wide ${isActive ? lvl.textColor : 'text-slate-700'}`}>{lvl.label}</span>
              <span className={`text-[9px] font-semibold opacity-80 ${isActive ? lvl.textColor : 'text-slate-400'}`}>
                {lvl.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
export default DifficultySelector;
