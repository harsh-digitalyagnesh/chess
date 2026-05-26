import { Chess } from 'chess.js';
import { CapturedPieces, GameStats } from '../types/chess';

// Standard point values for chess pieces
export const PIECE_VALUES: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

/**
 * Calculates captured pieces by comparing current board to the starting set.
 * Returns both White and Black captured pieces and the net score difference.
 * - whiteCaptured: Black pieces captured by White (represented in lowercase).
 * - blackCaptured: White pieces captured by Black (represented in uppercase).
 */
export const calculateGameStats = (chess: Chess): GameStats => {
  const defaultPieces = {
    p: 8,
    n: 2,
    b: 2,
    r: 2,
    q: 1,
  };

  const currentPieces: Record<'w' | 'b', Record<string, number>> = {
    w: { p: 0, n: 0, b: 0, r: 0, q: 0 },
    b: { p: 0, n: 0, b: 0, r: 0, q: 0 },
  };

  // Scan the entire board and count active pieces
  const board = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const square = board[r][c];
      if (square && square.type !== 'k') {
        currentPieces[square.color][square.type] = (currentPieces[square.color][square.type] || 0) + 1;
      }
    }
  }

  // Captured White pieces = starting count (White) - current active count (White)
  // Captured Black pieces = starting count (Black) - current active count (Black)
  const blackCaptured: CapturedPieces = {
    p: Math.max(0, defaultPieces.p - currentPieces.w.p),
    n: Math.max(0, defaultPieces.n - currentPieces.w.n),
    b: Math.max(0, defaultPieces.b - currentPieces.w.b),
    r: Math.max(0, defaultPieces.r - currentPieces.w.r),
    q: Math.max(0, defaultPieces.q - currentPieces.w.q),
  };

  const whiteCaptured: CapturedPieces = {
    p: Math.max(0, defaultPieces.p - currentPieces.b.p),
    n: Math.max(0, defaultPieces.n - currentPieces.b.n),
    b: Math.max(0, defaultPieces.b - currentPieces.b.b),
    r: Math.max(0, defaultPieces.r - currentPieces.b.r),
    q: Math.max(0, defaultPieces.q - currentPieces.b.q),
  };

  // Calculate material scores
  const whiteScore =
    currentPieces.w.p * PIECE_VALUES.p +
    currentPieces.w.n * PIECE_VALUES.n +
    currentPieces.w.b * PIECE_VALUES.b +
    currentPieces.w.r * PIECE_VALUES.r +
    currentPieces.w.q * PIECE_VALUES.q;

  const blackScore =
    currentPieces.b.p * PIECE_VALUES.p +
    currentPieces.b.n * PIECE_VALUES.n +
    currentPieces.b.b * PIECE_VALUES.b +
    currentPieces.b.r * PIECE_VALUES.r +
    currentPieces.b.q * PIECE_VALUES.q;

  return {
    whiteCaptured,
    blackCaptured,
    scoreDifference: whiteScore - blackScore,
  };
};

/**
 * Formats seconds into digital timer display (MM:SS)
 * When under 10 seconds, adds tenths of a second (e.g., 0:08.4)
 */
export const formatTime = (seconds: number): string => {
  if (seconds < 0) return '00:00';
  
  if (seconds < 10 && seconds > 0) {
    const dec = Math.floor((seconds % 1) * 10);
    const sec = Math.floor(seconds);
    return `00:0${sec}.${dec}`;
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const padMins = mins.toString().padStart(2, '0');
  const padSecs = secs.toString().padStart(2, '0');
  return `${padMins}:${padSecs}`;
};

/**
 * Validates a FEN string using a simple check
 */
export const isValidFen = (fen: string): boolean => {
  if (!fen) return false;
  try {
    const c = new Chess(fen);
    return c.fen() !== '';
  } catch {
    return false;
  }
};
