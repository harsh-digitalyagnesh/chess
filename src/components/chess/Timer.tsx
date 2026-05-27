'use client';

import React from 'react';
import { Clock, User, Cpu } from 'lucide-react';
import { useGame } from '../../store/gameStore';
import { formatTime } from '../../utils/chessHelpers';

export const Timer: React.FC = () => {
  const { gameState } = useGame();
  const { whiteTime, blackTime, isGameOver, fen, isAiThinking, boardOrientation, initialTime } = gameState;

  // Detect active side based on FEN turn flag
  const turn = fen.split(' ')[1] || 'w';
  const isWhiteActive = turn === 'w' && !isGameOver;
  const isBlackActive = turn === 'b' && !isGameOver;

  const renderClock = (
    label: string,
    time: number,
    isActive: boolean,
    isAi: boolean
  ) => {
    const isCritical = initialTime !== 0 && time < 30; // Under 30 seconds left is critical

    return (
      <div
        className={`flex flex-1 flex-col rounded-2xl bg-white p-4 border transition-all duration-300 shadow-sm ${
          isActive
            ? isCritical
              ? 'border-red-500/50 ring-1 ring-red-500/20 bg-red-50'
              : 'border-emerald-500/50 ring-1 ring-emerald-500/20 bg-emerald-50/40 shadow shadow-emerald-500/5'
            : 'border-slate-200/80'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${
              isActive ? 'bg-slate-900 text-emerald-400' : 'bg-slate-100 text-slate-400'
            }`}>
              {isAi ? <Cpu className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
            </div>
            <span className={`text-xs font-bold tracking-wide uppercase ${
              isActive ? 'text-slate-800 font-extrabold' : 'text-slate-400'
            }`}>
              {label}
            </span>
          </div>

          {isActive && initialTime !== 0 && (
            <span className="relative flex h-2 w-2">
              <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                isCritical ? 'bg-red-400' : 'bg-emerald-400'
              }`} />
              <span className={`relative inline-flex h-2 w-2 rounded-full ${
                isCritical ? 'bg-red-500' : 'bg-emerald-500'
              }`} />
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-1 mt-1 justify-center sm:justify-start">
          <Clock className={`h-4.5 w-4.5 self-center ${
            isActive
              ? isCritical ? 'text-red-500 animate-pulse' : 'text-emerald-500 animate-pulse'
              : 'text-slate-400'
          }`} />
          <span
            className={`font-mono text-3xl font-bold tracking-tight transition-all duration-300 ${
              isActive
                ? isCritical
                  ? 'text-red-600 scale-[1.02]'
                  : 'text-emerald-600'
                : 'text-slate-400'
            }`}
          >
            {initialTime === 0 ? '∞' : formatTime(time)}
          </span>
          
          {isAi && isAiThinking && isActive && (
            <span className="text-[10px] font-bold text-slate-400 animate-pulse uppercase ml-2 tracking-widest self-end pb-1.5">
              Analyzing...
            </span>
          )}
        </div>
      </div>
    );
  };

  const isPlayerWhite = boardOrientation === 'white';

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      {isPlayerWhite ? (
        <>
          {renderClock('Player (White)', whiteTime, isWhiteActive, false)}
          {renderClock('Stockfish (Black)', blackTime, isBlackActive, true)}
        </>
      ) : (
        <>
          {renderClock('Stockfish (White)', whiteTime, isWhiteActive, true)}
          {renderClock('Player (Black)', blackTime, isBlackActive, false)}
        </>
      )}
    </div>
  );
};
export default Timer;
