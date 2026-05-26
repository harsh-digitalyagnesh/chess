'use client';

import React from 'react';
import { useGame } from '../../store/gameStore';

export const GameStatus: React.FC = () => {
  const { gameState } = useGame();
  const { isGameOver, fen, isAiThinking } = gameState;

  // Derive current turn
  const turn = fen.split(' ')[1] || 'w';
  const isWhiteTurn = turn === 'w';

  // Do not render anything when the game is over (the chessboard overlay handles it)
  if (isGameOver) return null;

  return (
    <div className="w-full">
      {/* Active Turn/State Bar */}
      <div className="flex items-center justify-between rounded-xl bg-[#262522] px-4 py-3 border border-zinc-800/60 shadow-md">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
              isWhiteTurn ? 'bg-emerald-400' : 'bg-amber-400'
            }`} />
            <span className={`relative inline-flex h-2 w-2 rounded-full ${
              isWhiteTurn ? 'bg-emerald-500' : 'bg-amber-500'
            }`} />
          </span>
          <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
            {isWhiteTurn
              ? 'YOUR TURN (WHITE)'
              : isAiThinking
              ? 'AI THINKING... (BLACK)'
              : "STOCKFISH'S TURN (BLACK)"}
          </span>
        </div>

        <span className="text-[10px] font-bold text-zinc-500 tracking-wider">
          {isWhiteTurn ? 'Make your move' : 'Stockfish calculating'}
        </span>
      </div>
    </div>
  );
};
export default GameStatus;
