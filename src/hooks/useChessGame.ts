import { useState, useEffect, useRef, useCallback } from 'react';
import { Chess, Square } from 'chess.js';
import { useStockfish } from './useStockfish';
import { GameState, GameStats, Difficulty, BoardOrientation, HistoryMove } from '../types/chess';
import { calculateGameStats } from '../utils/chessHelpers';
import { playChessSound } from '../utils/sounds';
import { DIFFICULTY_DEPTHS, DEFAULT_INITIAL_TIME, START_FEN, STORAGE_KEY, AI_MOVE_DELAY } from '../utils/constants';

export const useChessGame = () => {
  // Use a ref for the Chess instance to prevent re-instantiation and double moves
  const chessRef = useRef<Chess>(new Chess());
  
  // Stockfish hook
  const { getBestMove, stopCalculation, isThinking: isAiThinking } = useStockfish();

  // Core visual state
  const [fen, setFen] = useState<string>(START_FEN);
  const [history, setHistory] = useState<HistoryMove[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(-1);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<GameState['gameResult']>(null);
  const [winner, setWinner] = useState<GameState['winner']>(null);
  const [boardOrientation, setBoardOrientation] = useState<BoardOrientation>('white');
  const [lastMove, setLastMove] = useState<GameState['lastMove']>(null);
  const [hasGameBegun, setHasGameBegun] = useState<boolean>(false);

  // Square interaction state
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);

  // Timers (in seconds)
  const [whiteTime, setWhiteTime] = useState<number>(DEFAULT_INITIAL_TIME);
  const [blackTime, setBlackTime] = useState<number>(DEFAULT_INITIAL_TIME);
  const [initialTime, setInitialTime] = useState<number>(DEFAULT_INITIAL_TIME);

  // Client hydration check
  const [isHydrated, setIsHydrated] = useState(false);

  // Game stats (captured pieces, material difference)
  const [gameStats, setGameStats] = useState<GameStats>({
    whiteCaptured: { p: 0, n: 0, b: 0, r: 0, q: 0 },
    blackCaptured: { p: 0, n: 0, b: 0, r: 0, q: 0 },
    scoreDifference: 0,
  });

  // Hydrate game from localStorage on client mount
  useEffect(() => {
    setIsHydrated(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const newChess = new Chess(data.fen);
        chessRef.current = newChess;
        
        setFen(data.fen);
        setHistory(data.history || []);
        setCurrentMoveIndex((data.history || []).length - 1);
        setDifficulty(data.difficulty || 'medium');
        setIsGameOver(data.isGameOver || false);
        setGameResult(data.gameResult || null);
        setWinner(data.winner || null);
        setBoardOrientation(data.boardOrientation || 'white');
        setWhiteTime(data.whiteTime ?? DEFAULT_INITIAL_TIME);
        setBlackTime(data.blackTime ?? DEFAULT_INITIAL_TIME);
        setInitialTime(data.initialTime ?? DEFAULT_INITIAL_TIME);
        setLastMove(data.lastMove || null);
        setHasGameBegun(data.hasGameBegun || (data.history && data.history.length > 0) || false);
        
        // Re-evaluate game stats
        setGameStats(calculateGameStats(newChess));
      } catch (e) {
        console.error('Failed to parse saved game state:', e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save game to localStorage on state changes
  useEffect(() => {
    if (!isHydrated) return;
    const stateToSave = {
      fen,
      history,
      difficulty,
      isGameOver,
      gameResult,
      winner,
      boardOrientation,
      whiteTime,
      blackTime,
      initialTime,
      lastMove,
      hasGameBegun,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [fen, history, difficulty, isGameOver, gameResult, winner, boardOrientation, whiteTime, blackTime, initialTime, lastMove, hasGameBegun, isHydrated]);

  // Timers countdown tick (runs at 100ms intervals)
  useEffect(() => {
    if (isGameOver || !isHydrated || !hasGameBegun || initialTime === 0) return;

    const interval = setInterval(() => {
      const activeTurn = chessRef.current.turn();
      
      if (activeTurn === 'w') {
        setWhiteTime((prev) => {
          if (prev <= 0.1) {
            handleTimeout('white');
            return 0;
          }
          return Number((prev - 0.1).toFixed(1));
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 0.1) {
            handleTimeout('black');
            return 0;
          }
          return Number((prev - 0.1).toFixed(1));
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isGameOver, fen, isHydrated, hasGameBegun]);

  // Handle timeout (flag fell)
  const handleTimeout = (timedOutPlayer: 'white' | 'black') => {
    setIsGameOver(true);
    setGameResult('timeout');
    setWinner(timedOutPlayer === 'white' ? 'black' : 'white');
    playChessSound('gameover');
  };

  // Evaluate status (Checkmate, Draw, etc.) after every move
  const updateGameStatus = (chess: Chess) => {
    const isCheckmate = chess.isGameOver() && chess.isCheckmate();
    const isStalemate = chess.isGameOver() && chess.isStalemate();
    const isDraw = chess.isGameOver() && (chess.isDraw() || chess.isInsufficientMaterial() || chess.isThreefoldRepetition());
    
    if (isCheckmate) {
      setIsGameOver(true);
      setGameResult('checkmate');
      setWinner(chess.turn() === 'w' ? 'black' : 'white'); // Active turn is the mated side
      playChessSound('gameover');
    } else if (isStalemate) {
      setIsGameOver(true);
      setGameResult('stalemate');
      setWinner('draw');
      playChessSound('gameover');
    } else if (isDraw) {
      setIsGameOver(true);
      let type: GameState['gameResult'] = 'draw';
      if (chess.isInsufficientMaterial()) type = 'insufficient';
      else if (chess.isThreefoldRepetition()) type = 'repetition';
      
      setGameResult(type);
      setWinner('draw');
      playChessSound('gameover');
    } else if (chess.inCheck()) {
      playChessSound('check');
    }
  };

  /**
   * Triggers the AI opponent using Stockfish.
   */
  const triggerAiOpponent = useCallback((currentFen: string, overrideDifficulty?: Difficulty) => {
    const activeDifficulty = overrideDifficulty || difficulty;
    const depth = DIFFICULTY_DEPTHS[activeDifficulty];
    
    getBestMove(currentFen, depth, (bestMove) => {
      // Delay AI move slightly to make it feel more natural
      setTimeout(() => {
        const chess = chessRef.current;
        if (chess.isGameOver()) return;

        const from = bestMove.substring(0, 2);
        const to = bestMove.substring(2, 4);
        const promotion = bestMove.length > 4 ? bestMove.charAt(4) : undefined;

        try {
          // Perform move inside chess.js
          const moveResult = chess.move({ from, to, promotion });
          
          if (moveResult) {
            // Determine sounds to play
            if (chess.inCheck()) {
              playChessSound('check');
            } else if (moveResult.captured) {
              playChessSound('capture');
            } else if (moveResult.san.includes('O-O')) {
              playChessSound('castle');
            } else {
              playChessSound('move');
            }

            const newFen = chess.fen();
            const newMove: HistoryMove = {
              san: moveResult.san,
              from,
              to,
              piece: moveResult.piece,
              color: moveResult.color,
              fen: newFen,
              timestamp: Date.now(),
            };

            const updatedHistory = [...history, newMove];
            setHistory(updatedHistory);
            setCurrentMoveIndex(updatedHistory.length - 1);
            setFen(newFen);
            setLastMove({ from, to });
            setGameStats(calculateGameStats(chess));
            updateGameStatus(chess);
          }
        } catch (err) {
          console.error('Error applying Stockfish best move:', err);
        }
      }, AI_MOVE_DELAY);
    });
  }, [difficulty, getBestMove, history]);

  /**
   * Triggers when the player executes a move via drag-and-drop or click.
   */
  const makeMove = useCallback((from: string, to: string, promotion?: string): boolean => {
    if (isGameOver || isAiThinking) return false;

    // Reset square highlighting
    setSelectedSquare(null);
    setLegalMoves([]);

    const chess = chessRef.current;
    
    // Auto-promote to Queen if a pawn reaches the back rank
    const piece = chess.get(from as Square);
    let finalPromotion = promotion;
    if (piece && piece.type === 'p') {
      const isWhitePromotion = piece.color === 'w' && to.endsWith('8');
      const isBlackPromotion = piece.color === 'b' && to.endsWith('1');
      if (isWhitePromotion || isBlackPromotion) {
        finalPromotion = 'q'; // Default to Queen for simpler experience
      }
    }

    try {
      const moveResult = chess.move({ from, to, promotion: finalPromotion });

      if (moveResult) {
        // Stop any pending calculations
        stopCalculation();

        // Sound cues
        if (chess.isGameOver()) {
          // Handled in updateGameStatus
        } else if (chess.inCheck()) {
          playChessSound('check');
        } else if (moveResult.captured) {
          playChessSound('capture');
        } else if (moveResult.san.includes('O-O')) {
          playChessSound('castle');
        } else {
          playChessSound('move');
        }

        const newFen = chess.fen();
        const newMove: HistoryMove = {
          san: moveResult.san,
          from,
          to,
          piece: moveResult.piece,
          color: moveResult.color,
          fen: newFen,
          timestamp: Date.now(),
        };

        const updatedHistory = [...history, newMove];
        setHistory(updatedHistory);
        setCurrentMoveIndex(updatedHistory.length - 1);
        setFen(newFen);
        setLastMove({ from, to });
        setGameStats(calculateGameStats(chess));
        updateGameStatus(chess);

        // If the game continues and the next turn is Black, trigger Stockfish
        if (!chess.isGameOver()) {
          triggerAiOpponent(newFen);
        }

        return true;
      }
    } catch {
      // Catch and safely ignore illegal moves
    }
    return false;
  }, [history, isGameOver, isAiThinking, triggerAiOpponent, stopCalculation]);

  /**
   * Undo the last player and AI moves
   */
  const undoMove = useCallback(() => {
    if (isAiThinking) return;

    const chess = chessRef.current;
    
    // We undo two moves (AI move and player move) so that the player gets back their turn
    const movesToUndo = chess.turn() === 'w' ? 2 : 1;
    let undoneCount = 0;

    for (let i = 0; i < movesToUndo; i++) {
      if (chess.undo()) {
        undoneCount++;
      }
    }

    if (undoneCount > 0) {
      stopCalculation();
      playChessSound('move');

      const newHistory = history.slice(0, -undoneCount);
      const newFen = chess.fen();
      const lastPlayedMove = newHistory[newHistory.length - 1] || null;

      setHistory(newHistory);
      setCurrentMoveIndex(newHistory.length - 1);
      setFen(newFen);
      setLastMove(lastPlayedMove ? { from: lastPlayedMove.from, to: lastPlayedMove.to } : null);
      
      // Reset statuses
      setIsGameOver(false);
      setGameResult(null);
      setWinner(null);
      
      setGameStats(calculateGameStats(chess));
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  }, [history, isAiThinking, stopCalculation]);

  /**
   * Reset / Restart the game
   */
  const restartGame = useCallback((timeInSeconds?: number) => {
    stopCalculation();
    const newChess = new Chess();
    chessRef.current = newChess;

    const selectedTime = timeInSeconds ?? initialTime;

    setFen(START_FEN);
    setHistory([]);
    setCurrentMoveIndex(-1);
    setIsGameOver(false);
    setGameResult(null);
    setWinner(null);
    setLastMove(null);
    setSelectedSquare(null);
    setLegalMoves([]);
    setWhiteTime(selectedTime);
    setBlackTime(selectedTime);
    setInitialTime(selectedTime);
    setGameStats(calculateGameStats(newChess));
    setHasGameBegun(false);

    playChessSound('move');
    localStorage.removeItem(STORAGE_KEY);
  }, [initialTime, stopCalculation]);

  /**
   * Starts a brand new game with chosen settings
   */
  const startGame = useCallback((selectedDifficulty: Difficulty, selectedTime: number, selectedOrientation: BoardOrientation) => {
    stopCalculation();
    const newChess = new Chess();
    chessRef.current = newChess;

    setFen(START_FEN);
    setHistory([]);
    setCurrentMoveIndex(-1);
    setIsGameOver(false);
    setGameResult(null);
    setWinner(null);
    setLastMove(null);
    setSelectedSquare(null);
    setLegalMoves([]);
    setDifficulty(selectedDifficulty);
    
    setWhiteTime(selectedTime);
    setBlackTime(selectedTime);
    setInitialTime(selectedTime);
    
    setBoardOrientation(selectedOrientation);
    setGameStats(calculateGameStats(newChess));
    setHasGameBegun(true);

    playChessSound('move');
    localStorage.removeItem(STORAGE_KEY);

    // If playing as Black, Stockfish (playing as White) goes first!
    if (selectedOrientation === 'black') {
      triggerAiOpponent(START_FEN, selectedDifficulty);
    }
  }, [stopCalculation, triggerAiOpponent]);

  /**
   * Flip the visual board orientation
   */
  const flipBoard = useCallback(() => {
    setBoardOrientation((prev) => (prev === 'white' ? 'black' : 'white'));
  }, []);

  /**
   * Change AI difficulty settings
   */
  const changeDifficulty = useCallback((newDiff: Difficulty) => {
    setDifficulty(newDiff);
  }, []);

  /**
   * Expose FEN Import functionality
   */
  const importFen = useCallback((newFen: string): boolean => {
    try {
      const testChess = new Chess(newFen);
      chessRef.current = testChess;
      
      stopCalculation();
      setFen(newFen);
      setHistory([]);
      setCurrentMoveIndex(-1);
      setIsGameOver(false);
      setGameResult(null);
      setWinner(null);
      setLastMove(null);
      setSelectedSquare(null);
      setLegalMoves([]);
      setGameStats(calculateGameStats(testChess));

      updateGameStatus(testChess);

      // If it's Black's turn on loading, fire AI instantly
      if (testChess.turn() === 'b' && !testChess.isGameOver()) {
        triggerAiOpponent(newFen);
      }

      playChessSound('move');
      return true;
    } catch {
      return false;
    }
  }, [stopCalculation, triggerAiOpponent]);

  /**
   * Expose PGN Export functionality
   */
  const exportPgn = useCallback((): string => {
    return chessRef.current.pgn();
  }, []);

  /**
   * Travel back in time to view a historical move in history panel
   */
  const selectHistoricalMove = useCallback((index: number) => {
    if (index < -1 || index >= history.length) return;

    setCurrentMoveIndex(index);
    const selectedFen = index === -1 ? START_FEN : history[index].fen;
    setFen(selectedFen);

    // Update last move highlights for history scanning
    if (index === -1) {
      setLastMove(null);
    } else {
      setLastMove({ from: history[index].from, to: history[index].to });
    }
  }, [history]);

  /**
   * Highlights legal moves for selected piece
   */
  const highlightLegalMoves = useCallback((square: string | null) => {
    if (isGameOver || isAiThinking) return;

    if (!square) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    const chess = chessRef.current;
    const piece = chess.get(square as Square);
    
    // Check if the clicked piece belongs to the active turn
    if (piece && piece.color === chess.turn()) {
      const moves = chess.moves({ square: square as Square, verbose: true });
      const targetSquares = moves.map((m) => m.to);
      
      setSelectedSquare(square);
      setLegalMoves(targetSquares);
    } else {
      // If we clicked an empty square or an opponent piece, reset highlights
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  }, [isGameOver, isAiThinking]);

  // Consolidate complete state
  const gameState: GameState = {
    fen,
    history,
    currentMoveIndex,
    difficulty,
    isGameOver,
    gameResult,
    winner,
    boardOrientation,
    isAiThinking,
    whiteTime,
    blackTime,
    initialTime,
    lastMove,
    hasGameBegun,
  };

  return {
    gameState,
    gameStats,
    selectedSquare,
    setSelectedSquare,
    legalMoves,
    setLegalMoves,
    makeMove,
    undoMove,
    restartGame,
    startGame,
    flipBoard,
    changeDifficulty,
    importFen,
    exportPgn,
    selectHistoricalMove,
    highlightLegalMoves,
  };
};
