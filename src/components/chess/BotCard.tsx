'use client';

import React, { useMemo } from 'react';
import { useGame } from '../../store/gameStore';
import { Chess } from 'chess.js';

export const BotCard: React.FC = () => {
  const { gameState } = useGame();
  const { history, isAiThinking, isGameOver, winner, fen } = gameState;

  // Determine active turn and check states
  const chess = useMemo(() => new Chess(fen), [fen]);
  const isChecked = chess.inCheck();

  // Dynamic witty bot quotes matching Polly's character
  const botQuote = useMemo(() => {
    if (isGameOver) {
      if (winner === 'black') {
        return 'Hope is indeed the strongest strategy! Care for another round?';
      } else if (winner === 'white') {
        return 'You played wonderfully! I must study my coordinates...';
      } else {
        return 'A tie! A well-balanced combat. Good game!';
      }
    }

    if (isAiThinking) {
      return 'Let me calculate... Hope is my strongest strategy, but math helps.';
    }

    if (isChecked) {
      return 'Oh! My king is in danger! I must act swiftly!';
    }

    if (history.length === 0) {
      return 'Hope is my strongest strategy.';
    }

    // Dynamic quotes based on game progress
    const moveCount = Math.floor(history.length / 2);
    if (moveCount < 5) {
      return 'A classic opening! Let us see how you proceed.';
    } else if (moveCount < 15) {
      return 'The board is becoming crowded. Do not lose focus!';
    } else {
      return 'An intense endgame... Every coordinate counts now!';
    }
  }, [isGameOver, winner, isAiThinking, isChecked, history.length]);

  return (
    <div className="flex items-center gap-4 bg-[#262522] rounded-xl p-4 border border-zinc-800/40">
      {/* Bot Avatar */}
      <div className="relative flex-shrink-0">
        <div className="h-16 w-16 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg">
          <div className="h-full w-full rounded-[10px] bg-zinc-900 flex items-center justify-center text-4xl shadow-inner">
            🦜
          </div>
        </div>
        <span className="absolute -bottom-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-white ring-2 ring-[#262522]">
          AI
        </span>
      </div>

      {/* Speech Bubble */}
      <div className="relative flex-1 bg-white rounded-xl py-3 px-4 shadow-md text-zinc-900 text-sm font-semibold">
        {/* Left pointing arrow */}
        <div className="absolute top-1/2 -left-2 h-4 w-4 -translate-y-1/2 rotate-45 bg-white rounded-sm pointer-events-none" />
        
        <p className="relative z-10 leading-relaxed font-sans select-none">
          "{botQuote}"
        </p>
      </div>
    </div>
  );
};
export default BotCard;
