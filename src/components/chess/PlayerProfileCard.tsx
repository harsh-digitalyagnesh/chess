'use client';

import React from 'react';
import { useGame } from '../../store/gameStore';
import { formatTime } from '../../utils/chessHelpers';
import { CapturedPieces } from '../../types/chess';

interface PlayerProfileCardProps {
  role: 'bot' | 'player';
}

const PIECE_SYMBOLS: Record<string, string> = {
  p: '♟',
  n: '♞',
  b: '♝',
  r: '♜',
  q: '♛',
};

export const PlayerProfileCard: React.FC<PlayerProfileCardProps> = ({ role }) => {
  const { gameState, gameStats } = useGame();
  const { whiteTime, blackTime, isGameOver, fen, boardOrientation, initialTime } = gameState;
  const { whiteCaptured, blackCaptured, scoreDifference } = gameStats;

  // Detect active turn from FEN turn flag
  const turn = fen.split(' ')[1] || 'w';

  const isBot = role === 'bot';
  const name = isBot ? 'Polly' : 'Guest';
  const flag = '';

  const isPlayerWhite = boardOrientation === 'white';

  // Determine active turn, time, and captured pieces based on who is playing what color
  let time: number;
  let isActive: boolean;
  let captured: CapturedPieces;

  if (isPlayerWhite) {
    // Bot is Black, Player is White
    time = isBot ? blackTime : whiteTime;
    isActive = isBot ? (turn === 'b' && !isGameOver) : (turn === 'w' && !isGameOver);
    captured = isBot ? blackCaptured : whiteCaptured;
  } else {
    // Bot is White, Player is Black
    time = isBot ? whiteTime : blackTime;
    isActive = isBot ? (turn === 'w' && !isGameOver) : (turn === 'b' && !isGameOver);
    captured = isBot ? whiteCaptured : blackCaptured;
  }

  // blackCaptured represents White pieces captured by Black!
  const showWhiteStyle = captured === blackCaptured;

  // Material lead score difference
  const showLead = isBot ? scoreDifference < 0 : scoreDifference > 0;
  const leadScore = Math.abs(scoreDifference);

  // Ordered list of types to display (Pawns -> Bishops -> Knights -> Rooks -> Queens)
  const ORDERED_TYPES: (keyof CapturedPieces)[] = ['p', 'b', 'n', 'r', 'q'];
  const hasCaptures = ORDERED_TYPES.some((type: keyof CapturedPieces) => (captured[type] || 0) > 0);

  return (
    <div className="flex items-center justify-between w-full max-w-[540px] px-3.5 py-1 font-sans select-none overflow-hidden">
      {/* Profile Details & Captured list - adaptive width */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
        {/* Profile Avatar matching user screenshot */}
        {isBot ? (
          <div className="relative flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-[#272522] border border-zinc-800/80 text-2xl shadow">
            🦜
          </div>
        ) : (
          <div className="relative flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-[#e1e0dd] border border-[#c9c8c4] text-2xl font-black text-[#8b8986] shadow">
            ♟
          </div>
        )}

        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm font-bold text-zinc-100 truncate">{name}</span>
            {flag && <span className="text-xs flex-shrink-0">{flag}</span>}
          </div>

          {/* Captured pieces inline row matching Chess.com - wraps on narrow displays */}
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            {!hasCaptures ? (
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide truncate">
                No captures
              </span>
            ) : (
              <div className="flex flex-wrap items-center gap-1 min-w-0">
                {ORDERED_TYPES.map((type: keyof CapturedPieces) => {
                  const count = captured[type] || 0;
                  if (count === 0) return null;

                  return (
                    <div key={type} className="flex -space-x-1 flex-shrink-0">
                      {Array.from({ length: count }).map((_, i) => (
                        <span
                          key={i}
                          className={`text-base leading-none select-none tracking-tighter ${showWhiteStyle
                              ? 'text-[#eae8e4]' // White pieces captured by Polly
                              : 'text-[#1a1918]' // Black pieces captured by Guest
                            }`}
                        >
                          {PIECE_SYMBOLS[type]}
                        </span>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Score advantage leader badge with Chess.com rating crowns */}
            {showLead && (
              <div className="flex items-center gap-1 ml-1 select-none flex-shrink-0">
                <span className="text-[10px] font-black text-zinc-400 uppercase">
                  +{leadScore}
                </span>
                {isBot && (
                  <div className="flex items-center text-[11px] leading-none">
                    <span className="text-amber-500">👑</span>
                    <span className="text-amber-500">👑</span>
                    <span className="text-zinc-650 opacity-45">👑</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clock Timer - fixed size, never shrinks or overflows */}
      <div
        className={`flex-shrink-0 flex items-center justify-center min-w-[76px] px-2.5 py-1 rounded-lg font-mono text-base font-extrabold tracking-tight transition-all duration-300 shadow-md ${isActive
            ? (initialTime !== 0 && time < 30)
              ? 'bg-red-600 text-white animate-pulse'
              : 'bg-emerald-600 text-white'
            : 'bg-[#262522] border border-zinc-850 text-zinc-200'
          }`}
      >
        {initialTime === 0 ? '∞' : formatTime(time)}
      </div>
    </div>
  );
};
export default PlayerProfileCard;
