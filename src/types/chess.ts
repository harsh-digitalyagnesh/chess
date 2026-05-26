export type Difficulty = 'easy' | 'medium' | 'hard';

export type BoardOrientation = 'white' | 'black';

export interface HistoryMove {
  san: string;
  from: string;
  to: string;
  piece: string;
  color: 'w' | 'b';
  fen: string;
  timestamp: number;
}

export interface CapturedPieces {
  p: number; // Pawns
  n: number; // Knights
  b: number; // Bishops
  r: number; // Rooks
  q: number; // Queens
}

export interface GameStats {
  whiteCaptured: CapturedPieces;
  blackCaptured: CapturedPieces;
  scoreDifference: number; // Positive means White is winning, negative means Black
}

export interface GameState {
  fen: string;
  history: HistoryMove[];
  currentMoveIndex: number; // For reviewing past moves
  difficulty: Difficulty;
  isGameOver: boolean;
  gameResult: 'checkmate' | 'draw' | 'stalemate' | 'insufficient' | 'repetition' | 'timeout' | null;
  winner: 'white' | 'black' | 'draw' | null;
  boardOrientation: BoardOrientation;
  isAiThinking: boolean;
  whiteTime: number; // in seconds
  blackTime: number; // in seconds
  initialTime: number; // in seconds (for timer reset)
  lastMove: { from: string; to: string } | null;
}
