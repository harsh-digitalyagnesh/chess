'use client';

import React from 'react';
import { useGame } from '../../store/gameStore';
import { CapturedPieces as ICapturedPieces } from '../../types/chess';

// Map piece keys to their visual symbols
const PIECE_SYMBOLS: Record<string, string> = {
  p: '♟',
  n: '♞',
  b: '♝',
  r: '♜',
  q: '♛',
};

export const CapturedPieces: React.FC = () => {
  const { gameStats } = useGame();
  const { whiteCaptured, blackCaptured, scoreDifference } = gameStats;

  const renderCapturedGroup = (
    captured: ICapturedPieces,
    colorTheme: 'white' | 'black'
  ) => {
    const list = Object.entries(captured).filter(([_, count]) => count > 0);

    if (list.length === 0) {
      return <span className="text-[11px] font-semibold text-slate-400 tracking-wider">NO CAPTURES</span>;
    }

    return (
      <div className="flex flex-wrap items-center gap-1.5">
        {list.map(([type, count]) => {
          return (
            <div
              key={type}
              className={`flex items-center gap-0.5 rounded-lg px-2 py-0.5 text-xs font-bold shadow-sm ${
                colorTheme === 'white'
                  ? 'bg-slate-100 text-slate-800 border border-slate-200/60' // White captured Black's pieces (visible Black pieces)
                  : 'bg-slate-200 text-slate-600 border border-slate-300/40' // Black captured White's pieces (visible White pieces)
              }`}
            >
              <span className={`text-sm ${colorTheme === 'white' ? 'text-slate-900' : 'text-slate-500'}`}>
                {PIECE_SYMBOLS[type]}
              </span>
              {count > 1 && (
                <span className="text-[9px] font-extrabold text-slate-400 ml-0.5">
                  ×{count}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const isWhiteLeading = scoreDifference > 0;
  const isBlackLeading = scoreDifference < 0;

  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-wide text-slate-700 uppercase">
          Captured Pieces
        </h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Material Advantage
        </span>
      </div>

      <div className="flex flex-col gap-3 mt-1">
        {/* White captures (Black pieces captured by White) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wide text-slate-400 uppercase">
              Captured by White (Player)
            </span>
            {isWhiteLeading && (
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-600 border border-emerald-200 shadow-sm animate-pulse">
                +{scoreDifference}
              </span>
            )}
          </div>
          <div className="flex min-h-8 items-center rounded-xl bg-slate-50/50 border border-slate-200/60 px-3 py-1.5">
            {renderCapturedGroup(whiteCaptured, 'white')}
          </div>
        </div>

        {/* Black captures (White pieces captured by Black) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wide text-slate-400 uppercase">
              Captured by Black (Stockfish)
            </span>
            {isBlackLeading && (
              <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-extrabold text-red-600 border border-red-200 shadow-sm animate-pulse">
                +{Math.abs(scoreDifference)}
              </span>
            )}
          </div>
          <div className="flex min-h-8 items-center rounded-xl bg-slate-50/50 border border-slate-200/60 px-3 py-1.5">
            {renderCapturedGroup(blackCaptured, 'black')}
          </div>
        </div>
      </div>
    </div>
  );
};
export default CapturedPieces;
