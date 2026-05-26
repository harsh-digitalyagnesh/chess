import React, { createContext, useContext } from 'react';
import { GameState, GameStats, Difficulty } from '../types/chess';

export interface GameContextType {
  gameState: GameState;
  gameStats: GameStats;
  selectedSquare: string | null;
  setSelectedSquare: (square: string | null) => void;
  legalMoves: string[];
  setLegalMoves: (moves: string[]) => void;
  makeMove: (from: string, to: string, promotion?: string) => boolean;
  undoMove: () => void;
  restartGame: (timeInSeconds?: number) => void;
  flipBoard: () => void;
  changeDifficulty: (difficulty: Difficulty) => void;
  importFen: (fen: string) => boolean;
  exportPgn: () => string;
  selectHistoricalMove: (index: number) => void;
  highlightLegalMoves: (square: string | null) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{
  children: React.ReactNode;
  value: GameContextType;
}> = ({ children, value }) => {
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
