'use client';

import React, { useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, AlertTriangle, Clock, Sparkles, RefreshCw } from 'lucide-react';
import { useGame } from '../../store/gameStore';

export const ChessBoard: React.FC = () => {
  const {
    gameState,
    selectedSquare,
    legalMoves,
    makeMove,
    highlightLegalMoves,
    restartGame,
  } = useGame();

  const { fen, boardOrientation, isAiThinking, lastMove } = gameState;

  // Initialize a temporary Chess instance to examine square details (occupied vs empty)
  const chess = useMemo(() => new Chess(fen), [fen]);

  // Determine if active king is in check and locate its square
  const { isChecked, kingSquare } = useMemo(() => {
    const checked = chess.inCheck();
    let kingSq: string | null = null;
    
    if (checked) {
      const board = chess.board();
      const turn = chess.turn();
      
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const cell = board[r][c];
          if (cell && cell.type === 'k' && cell.color === turn) {
            kingSq = `${String.fromCharCode(97 + c)}${8 - r}`;
            break;
          }
        }
      }
    }
    return { isChecked: checked, kingSquare: kingSq };
  }, [chess]);

  // Compile custom styles for specific squares (last move, check, legal moves, selected)
  const squareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};

    // 1. Highlight selected square (gold glowing block)
    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: 'rgba(247, 247, 105, 0.45)',
        boxShadow: 'inset 0 0 0 2px rgba(247, 247, 105, 0.8)',
      };
    }

    // 2. Highlight legal moves
    legalMoves.forEach((square) => {
      const hasPiece = chess.get(square as any);
      
      styles[square] = {
        backgroundImage: hasPiece
          ? 'radial-gradient(circle, transparent 58%, rgba(16, 185, 129, 0.7) 62%)' // Ring for capture
          : 'radial-gradient(circle, rgba(16, 185, 129, 0.6) 18%, transparent 22%)', // Small dot for empty square
        borderRadius: '50%',
      };
    });

    // 3. Highlight last played move (Chess.com light yellow overlay)
    if (lastMove) {
      const { from, to } = lastMove;
      styles[from] = {
        ...styles[from],
        backgroundColor: 'rgba(247, 247, 105, 0.22)',
      };
      styles[to] = {
        ...styles[to],
        backgroundColor: 'rgba(247, 247, 105, 0.32)',
      };
    }

    // 4. Highlight King in check (soft crimson gradient)
    if (isChecked && kingSquare) {
      styles[kingSquare] = {
        ...styles[kingSquare],
        backgroundImage: 'radial-gradient(circle, rgba(239, 68, 68, 0.5) 45%, rgba(239, 68, 68, 0.1) 100%)',
        boxShadow: 'inset 0 0 0 2px rgba(239, 68, 68, 0.5)',
      };
    }

    return styles;
  }, [selectedSquare, legalMoves, lastMove, isChecked, kingSquare, chess]);

  // Handle square clicks for clicking-based moves
  const handleSquareClick = (square: string) => {
    if (gameState.isGameOver || isAiThinking) return;

    if (selectedSquare === square) {
      // De-select
      highlightLegalMoves(null);
    } else if (selectedSquare && legalMoves.includes(square)) {
      // Make move
      makeMove(selectedSquare, square);
    } else {
      // Select new piece
      highlightLegalMoves(square);
    }
  };

  // Drag and drop handler
  const handlePieceDrop = ({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: string;
    targetSquare: string | null;
  }): boolean => {
    if (!targetSquare) return false;
    return makeMove(sourceSquare, targetSquare);
  };

  // Derive game-over status and result details
  const { isGameOver, gameResult, winner } = gameState;

  const getResultDetails = () => {
    let title = 'Game Over';
    let subtitle = '';
    let icon = AlertTriangle;
    let iconColor = 'text-amber-400';

    if (gameResult === 'checkmate') {
      title = 'Checkmate!';
      icon = Trophy;
      iconColor = 'text-yellow-400';
      subtitle = winner === 'white' ? 'White wins the battle!' : 'Black (Stockfish) wins the battle!';
    } else if (gameResult === 'stalemate') {
      title = 'Stalemate!';
      subtitle = 'No legal moves remaining. It is a draw.';
    } else if (gameResult === 'insufficient') {
      title = 'Insufficient Material!';
      subtitle = 'Neither player has enough pieces to checkmate. It is a draw.';
    } else if (gameResult === 'repetition') {
      title = 'Threefold Repetition!';
      subtitle = 'The exact same position occurred three times. Draw declared.';
    } else if (gameResult === 'timeout') {
      title = 'Time Out!';
      icon = Clock;
      iconColor = 'text-red-400';
      subtitle = winner === 'white' ? 'White wins on time!' : 'Black wins on time!';
    } else if (gameResult === 'draw') {
      title = 'Game Drawn';
      subtitle = 'Players agreed or draw declared.';
    }

    return { title, subtitle, icon, iconColor };
  };

  const { title, subtitle, icon: ResultIcon, iconColor } = getResultDetails();

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-[540px] aspect-square">
      {/* Outer pulsing neon ring when AI is thinking */}
      <div
        className={`absolute -inset-2.5 -z-10 rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-transparent to-teal-500/20 opacity-0 transition-opacity duration-700 blur-xl ${
          isAiThinking ? 'opacity-100 animate-pulse' : ''
        }`}
      />

      <div
        className={`relative w-full rounded-xl overflow-hidden border bg-zinc-950/40 shadow-2xl transition-all duration-500 ${
          isAiThinking
            ? 'border-emerald-500/50 shadow-emerald-500/10'
            : 'border-zinc-800/80 shadow-black/80'
        }`}
      >
        <Chessboard
          options={{
            position: fen,
            onPieceDrop: handlePieceDrop,
            onSquareClick: ({ square }) => handleSquareClick(square),
            boardOrientation: boardOrientation,
            squareStyles: squareStyles,
            allowDragging: !gameState.isGameOver && !isAiThinking,
            animationDurationInMs: 260,
            darkSquareStyle: { backgroundColor: '#b58863' }, // Chess.com Wood Brown
            lightSquareStyle: { backgroundColor: '#f0d9b5' }, // Chess.com Wood Cream
            boardStyle: {
              borderRadius: '8px',
              boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.45)',
            },
          }}
        />

        {/* Beautiful game-over overlay matching Chess.com Bot Play modals */}
        <AnimatePresence>
          {isGameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/65 backdrop-blur-[3px] p-6 text-center select-none"
            >
              <motion.div
                initial={{ scale: 0.88, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.88, opacity: 0 }}
                transition={{ type: 'spring', duration: 0.4 }}
                className="w-full max-w-[320px] rounded-2xl bg-[#262522] border border-zinc-850 p-6 shadow-2xl shadow-black/95 flex flex-col items-center gap-4 animate-fadeIn"
              >
                {/* Status Indicator Icon */}
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 shadow-inner">
                  <ResultIcon className={`h-8 w-8 ${iconColor}`} />
                  <Sparkles className="absolute -top-1.5 -right-1.5 h-4 w-4 text-yellow-500 animate-pulse" />
                </div>

                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-black tracking-tight text-white uppercase">
                    {title}
                  </h2>
                  <p className="text-xs font-semibold text-zinc-400 max-w-[240px] leading-relaxed">
                    {subtitle}
                  </p>
                </div>

                {/* Primary Call-to-Action button */}
                <button
                  onClick={() => restartGame()}
                  className="flex items-center justify-center gap-2 w-full py-3 mt-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-white font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition-all duration-150 cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>PLAY AGAIN</span>
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Mini Overlay when AI is thinking */}
      {isAiThinking && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center gap-2 rounded-full bg-[#262522] border border-zinc-800 px-4 py-2 text-xs font-bold text-zinc-100 shadow-2xl shadow-black/85 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="tracking-wide animate-pulse">AI IS ANALYZING...</span>
        </div>
      )}
    </div>
  );
};
export default ChessBoard;
