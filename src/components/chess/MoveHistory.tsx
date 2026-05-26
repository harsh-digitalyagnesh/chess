'use client';

import React, { useEffect, useRef } from 'react';
import { Play, RotateCcw, ListCollapse } from 'lucide-react';
import { useGame } from '../../store/gameStore';

export const MoveHistory: React.FC = () => {
  const { gameState, selectHistoricalMove } = useGame();
  const { history, currentMoveIndex } = gameState;
  const containerRef = useRef<HTMLDivElement>(null);

  // Group moves into pairs (White, Black)
  const movePairs: {
    roundNumber: number;
    white: { san: string; index: number } | null;
    black: { san: string; index: number } | null;
  }[] = [];

  for (let i = 0; i < history.length; i += 2) {
    movePairs.push({
      roundNumber: Math.floor(i / 2) + 1,
      white: { san: history[i].san, index: i },
      black: history[i + 1] ? { san: history[i + 1].san, index: i + 1 } : null,
    });
  }

  // Auto-scroll to the bottom of move history when a new move is made
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history.length]);

  const isTimeTraveling = currentMoveIndex < history.length - 1;

  return (
    <div className="flex flex-col flex-1 min-h-[220px] rounded-2xl bg-[#262522] border border-zinc-800/40 shadow-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#201f1c] px-4 py-3 border-b border-zinc-800/40">
        <div className="flex items-center gap-1.5">
          <ListCollapse className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-bold tracking-wide text-zinc-300 uppercase">
            MOVE HISTORY
          </h3>
        </div>

        {isTimeTraveling && (
          <button
            onClick={() => selectHistoricalMove(history.length - 1)}
            className="flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-extrabold text-emerald-400 border border-emerald-500/20 shadow hover:bg-emerald-500/20 transition cursor-pointer"
          >
            <Play className="h-3 w-3 fill-emerald-400" />
            <span>LIVE POS</span>
          </button>
        )}
      </div>

      {/* Move List */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-2 py-2 max-h-[280px] custom-scrollbar"
      >
        {movePairs.length === 0 ? (
          <div className="flex h-full items-center justify-center py-10 text-center flex-col gap-1.5">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">
              Game Started
            </span>
            <span className="text-[10px] text-zinc-400">
              Moves will appear here as they are played.
            </span>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800/40 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                <th className="py-1 px-3 w-12 text-center">#</th>
                <th className="py-1 px-3">White (Player)</th>
                <th className="py-1 px-3">Black (AI)</th>
              </tr>
            </thead>
            <tbody>
              {movePairs.map((pair) => (
                <tr
                  key={pair.roundNumber}
                  className="border-b border-zinc-900/40 hover:bg-zinc-850 transition-colors"
                >
                  {/* Round number */}
                  <td className="py-1.5 px-3 text-center text-xs font-bold text-zinc-400 font-mono">
                    {pair.roundNumber}.
                  </td>

                  {/* White move */}
                  <td className="py-1.5 px-3">
                    {pair.white && (
                      <button
                        onClick={() => selectHistoricalMove(pair.white!.index)}
                        className={`w-full text-left rounded px-2 py-0.5 font-mono text-xs font-bold transition-all cursor-pointer ${
                          currentMoveIndex === pair.white.index
                            ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
                            : 'text-zinc-200 hover:bg-zinc-800 hover:text-white'
                        }`}
                      >
                        {pair.white.san}
                      </button>
                    )}
                  </td>

                  {/* Black move */}
                  <td className="py-1.5 px-3">
                    {pair.black ? (
                      <button
                        onClick={() => selectHistoricalMove(pair.black!.index)}
                        className={`w-full text-left rounded px-2 py-0.5 font-mono text-xs font-bold transition-all cursor-pointer ${
                          currentMoveIndex === pair.black.index
                            ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
                            : 'text-zinc-200 hover:bg-zinc-800 hover:text-white'
                        }`}
                      >
                        {pair.black.san}
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-zinc-400 italic tracking-wider animate-pulse ml-2">
                        {gameState.isAiThinking ? 'Thinking...' : '...'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
export default MoveHistory;
