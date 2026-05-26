'use client';

import React, { useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import ChessBoard from '../components/chess/ChessBoard';
import { PlayerProfileCard } from '../components/chess/PlayerProfileCard';
import { BotCard } from '../components/chess/BotCard';
import MoveHistory from '../components/chess/MoveHistory';
import GameStatus from '../components/chess/GameStatus';
import GameControls from '../components/chess/GameControls';
import { GameProvider, GameContextType } from '../store/gameStore';
import { useChessGame } from '../hooks/useChessGame';
import { Keyboard, HelpCircle } from 'lucide-react';

export default function Home() {
  const gameApi = useChessGame();
  
  const {
    gameState,
    undoMove,
    restartGame,
    flipBoard,
    selectHistoricalMove,
    changeDifficulty,
  } = gameApi;

  const { history, currentMoveIndex, isAiThinking, difficulty } = gameState;

  // Local state for Bot Select Modal
  const [showBotModal, setShowBotModal] = React.useState(false);

  // Bind professional keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keystrokes when typing inside inputs
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.getAttribute('contenteditable') === 'true')
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      switch (key) {
        case 'u':
          e.preventDefault();
          if (history.length > 0 && !isAiThinking) {
            undoMove();
          }
          break;
        case 'f':
          e.preventDefault();
          flipBoard();
          break;
        case 'r':
          e.preventDefault();
          if (!isAiThinking) {
            restartGame();
          }
          break;
        case 'h':
          e.preventDefault();
          selectHistoricalMove(history.length - 1);
          break;
        case 'arrowleft':
          e.preventDefault();
          if (currentMoveIndex > -1) {
            selectHistoricalMove(currentMoveIndex - 1);
          }
          break;
        case 'arrowright':
          e.preventDefault();
          if (currentMoveIndex < history.length - 1) {
            selectHistoricalMove(currentMoveIndex + 1);
          }
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoMove, flipBoard, restartGame, selectHistoricalMove, currentMoveIndex, history.length, isAiThinking]);

  return (
    <GameProvider value={gameApi}>
      <div className="min-h-screen flex flex-col bg-[#302e2b] relative overflow-hidden">
        {/* Ambient top glowing circles */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-emerald-500/2 blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-teal-500/2 blur-3xl -z-10 pointer-events-none" />

        <Navbar />

        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl flex flex-col lg:flex-row gap-8 items-start justify-center">
            
            {/* Left Panel: Chess.com Bot Profile, Wooden Board, Player Profile */}
            <div className="w-full lg:flex-1 flex flex-col items-center gap-3 lg:sticky lg:top-24">
              
              {/* Bot Profile Card (Above Board) */}
              <PlayerProfileCard role="bot" />

              {/* Centered Board Wrapper */}
              <div className="w-full flex justify-center">
                <ChessBoard />
              </div>

              {/* Player Profile Card (Below Board) */}
              <PlayerProfileCard role="player" />

              {/* Mobile Actions: "Play Bots" Button, Parrot Dialogue, Move History, and Controls (ONLY on Mobile below lg) */}
              <div className="lg:hidden w-full max-w-[540px] flex flex-col gap-3">
                {/* Play Bots Button */}
                <button
                  onClick={() => setShowBotModal(true)}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white hover:bg-zinc-100 active:scale-[0.98] text-[#1c1b18] font-black text-sm shadow-md transition-all duration-150 cursor-pointer"
                >
                  <span className="text-base">🤖</span>
                  <span>Play Bots</span>
                </button>

                {/* Mobile Dialogue Speech Bubble */}
                <BotCard />

                {/* Mobile Move History Table */}
                <MoveHistory />

                {/* Mobile Game Controls Panel */}
                <GameControls />
              </div>

              {/* Status notifications / check overlays */}
              <div className="w-full max-w-[540px]">
                <GameStatus />
              </div>

              {/* Floating short keybind helper bar */}
              <div className="hidden sm:flex items-center gap-4 rounded-xl bg-[#262522] px-4 py-2 border border-zinc-800/40 shadow-lg text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                <div className="flex items-center gap-1">
                  <Keyboard className="h-3.5 w-3.5 text-zinc-500" />
                  <span>SHORTCUTS:</span>
                </div>
                <span>[F] FLIP</span>
                <span>•</span>
                <span>[U] UNDO</span>
                <span>•</span>
                <span>[R] RESTART</span>
                <span>•</span>
                <span>[← / →] HISTORY BROWSE</span>
              </div>
            </div>

            {/* Right Panel: Bot Character Card, History & Chess.com Controls (ONLY on Desktop lg+) */}
            <div className="hidden lg:flex w-full lg:w-[420px] flex-col gap-4 self-stretch justify-between">
              
              {/* Dynamic Speech Dialogue */}
              <BotCard />

              {/* Move history list */}
              <MoveHistory />

              {/* Analysis & action controls panel */}
              <GameControls />
            </div>

          </div>
        </main>
      </div>

      {/* Popups: New Bot select modal (Global overlay in page.tsx) */}
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
    </GameProvider>
  );
}
