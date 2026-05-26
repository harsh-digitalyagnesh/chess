'use client';

import React, { useState, useMemo } from 'react';
import { Share2, Download, Settings, ChevronLeft, ChevronRight, Check, Plus, RotateCcw } from 'lucide-react';
import { useGame } from '../../store/gameStore';
import { isValidFen } from '../../utils/chessHelpers';

export const GameControls: React.FC = () => {
  const { gameState, restartGame, selectHistoricalMove, exportPgn, importFen, changeDifficulty } = useGame();
  const { history, currentMoveIndex, isAiThinking, difficulty } = gameState;

  // Local state for toggling features and FEN imports
  const [showFenInput, setShowFenInput] = useState(false);
  const [fenText, setFenText] = useState('');
  const [fenError, setFenError] = useState(false);
  const [copiedPgn, setCopiedPgn] = useState(false);
  const [showBotModal, setShowBotModal] = useState(false);

  // Compute active move scanning arrows
  const canGoBack = currentMoveIndex >= 0;
  const canGoForward = currentMoveIndex < history.length - 1;

  const handlePrevMove = () => {
    if (canGoBack) {
      selectHistoricalMove(currentMoveIndex - 1);
    }
  };

  const handleNextMove = () => {
    if (canGoForward) {
      selectHistoricalMove(currentMoveIndex + 1);
    }
  };

  // Copy PGN (Share action)
  const handleShare = async () => {
    try {
      const pgn = exportPgn();
      if (!pgn) return;
      await navigator.clipboard.writeText(pgn);
      setCopiedPgn(true);
      setTimeout(() => setCopiedPgn(false), 2000);
    } catch (err) {
      console.error('Failed to copy PGN:', err);
    }
  };

  // Download PGN
  const handleDownload = () => {
    const pgn = exportPgn();
    if (!pgn) return;
    const blob = new Blob([pgn], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `polly-vs-guest-${Date.now()}.pgn`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import custom FEN
  const handleImportFen = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValidFen(fenText.trim())) {
      importFen(fenText.trim());
      setFenText('');
      setShowFenInput(false);
      setFenError(false);
    } else {
      setFenError(true);
      setTimeout(() => setFenError(false), 3000);
    }
  };

  // Mocked move analysis stats based on move counts for ultra-realistic UI feedback
  const analysisStats = useMemo(() => {
    const totalMoves = history.length;
    if (totalMoves === 0) {
      return { best: 0, excellent: 0, miss: 0 };
    }
    // Witty distribution based on move count
    return {
      best: Math.max(1, Math.floor(totalMoves * 0.45)),
      excellent: Math.max(2, Math.floor(totalMoves * 0.35)),
      miss: Math.floor(totalMoves * 0.08),
    };
  }, [history.length]);

  return (
    <div className="flex flex-col gap-4 bg-[#262522] rounded-xl p-4 border border-zinc-800/40 shadow-lg font-sans">
      {/* 1. Game Analysis stats row */}
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          {/* Best Badge */}
          <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-zinc-900/30 border border-zinc-800/30">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs font-black text-white mb-1 shadow shadow-emerald-500/20">
              ★
            </span>
            <span className="text-xs font-extrabold text-zinc-100">{analysisStats.best}</span>
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide">Best</span>
          </div>

          {/* Excellent Badge */}
          <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-zinc-900/30 border border-zinc-800/30">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-xs font-black text-white mb-1 shadow shadow-emerald-600/20">
              👍
            </span>
            <span className="text-xs font-extrabold text-zinc-100">{analysisStats.excellent}</span>
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide">Excellent</span>
          </div>

          {/* Miss Badge */}
          <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-zinc-900/30 border border-zinc-800/30">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-black text-white mb-1 shadow shadow-red-500/20">
              ×
            </span>
            <span className="text-xs font-extrabold text-zinc-100">{analysisStats.miss}</span>
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide">Miss</span>
          </div>
        </div>

        {/* Big analysis button */}
        <button className="w-full py-2.5 rounded-lg bg-[#3c3b39] hover:bg-[#484745] text-zinc-200 hover:text-white font-extrabold text-xs tracking-wide transition shadow cursor-pointer select-none">
          Create Account to View Analysis
        </button>
      </div>

      {/* 2. Primary button row */}
      <div className="grid grid-cols-2 gap-3 border-t border-zinc-800/60 pt-3.5">
        {/* + New Bot Button */}
        <button
          onClick={() => setShowBotModal(true)}
          disabled={isAiThinking}
          className="flex items-center justify-center gap-1.5 py-3 rounded-lg bg-[#3c3b39] hover:bg-[#484745] disabled:opacity-40 disabled:cursor-not-allowed text-zinc-100 font-extrabold text-sm shadow transition cursor-pointer select-none"
        >
          <Plus className="h-4 w-4 text-emerald-400 stroke-[3]" />
          <span>New Bot</span>
        </button>

        {/* Rematch/Restart Button */}
        <button
          onClick={() => restartGame()}
          disabled={isAiThinking}
          className="flex items-center justify-center gap-1.5 py-3 rounded-lg bg-[#3c3b39] hover:bg-[#484745] disabled:opacity-40 disabled:cursor-not-allowed text-zinc-100 font-extrabold text-sm shadow transition cursor-pointer select-none"
        >
          <RotateCcw className="h-4.5 w-4.5 text-zinc-200" />
          <span>Rematch</span>
        </button>
      </div>

      {/* 3. Footer Toolbar (Share, Download, Settings, Time Travel keys) */}
      <div className="flex items-center justify-between border-t border-zinc-800/60 pt-3 mt-1.5 text-zinc-400 select-none">
        {/* Left-side tools */}
        <div className="flex items-center gap-2">
          {/* Share */}
          <button
            onClick={handleShare}
            className="p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition cursor-pointer"
            title="Copy PGN string"
          >
            {copiedPgn ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
          </button>
          
          {/* Download */}
          <button
            onClick={handleDownload}
            disabled={history.length === 0}
            className="p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
            title="Download PGN file"
          >
            <Download className="h-4 w-4" />
          </button>

          {/* Settings / FEN toggle */}
          <button
            onClick={() => setShowFenInput(!showFenInput)}
            className={`p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition cursor-pointer ${
              showFenInput ? 'bg-zinc-800 text-zinc-100' : ''
            }`}
            title="Import custom FEN position"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>

        {/* Right-side history scanner */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrevMove}
            disabled={!canGoBack}
            className="p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
            title="Previous Move"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={handleNextMove}
            disabled={!canGoForward}
            className="p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
            title="Next Move"
          >
            <ChevronRight className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Popups: FEN import overlay */}
      {showFenInput && (
        <form
          onSubmit={handleImportFen}
          className="flex flex-col gap-2 rounded-lg bg-zinc-950/60 p-3 border border-zinc-800 animate-fadeIn"
        >
          <label className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest">
            IMPORT FEN POSITION
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={fenText}
              onChange={(e) => setFenText(e.target.value)}
              placeholder="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
              className="flex-1 rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/50"
            />
            <button
              type="submit"
              className="rounded bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-3 cursor-pointer"
            >
              LOAD
            </button>
          </div>
          {fenError && (
            <span className="text-[9px] font-bold text-red-500 tracking-wider">
              INVALID FEN FORMAT!
            </span>
          )}
        </form>
      )}

      {/* Popups: New Bot select modal */}
      {showBotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#262522] border border-zinc-800 p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-zinc-100 uppercase tracking-wide">
                SELECT BOT DIFFICULTIES
              </h3>
              <button
                onClick={() => setShowBotModal(false)}
                className="text-zinc-400 hover:text-zinc-200 font-bold text-lg cursor-pointer"
              >
                ×
              </button>
            </div>
            
            <div className="flex flex-col gap-2.5">
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    changeDifficulty(level);
                    setShowBotModal(false);
                    restartGame();
                  }}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-bold transition capitalize cursor-pointer ${
                    difficulty === level
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                      : 'bg-zinc-950/20 border-zinc-800 text-zinc-400 hover:border-zinc-700/60 hover:text-zinc-200'
                  }`}
                >
                  <span>{level} Bot</span>
                  <span className="text-[10px] font-black text-zinc-400 uppercase">
                    {level === 'easy' ? 'Depth 1' : level === 'medium' ? 'Depth 5' : 'Depth 10'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default GameControls;
