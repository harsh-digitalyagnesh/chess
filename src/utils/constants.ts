import { Difficulty } from '../types/chess';

export const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const DIFFICULTY_DEPTHS: Record<Difficulty, number> = {
  easy: 1,
  medium: 5,
  hard: 10,
};

export const TIMER_PRESETS = [
  { label: '1 Min (Bullet)', value: 60 },
  { label: '3 Min (Blitz)', value: 180 },
  { label: '5 Min (Blitz)', value: 300 },
  { label: '10 Min (Rapid)', value: 600 },
  { label: '30 Min (Classical)', value: 1800 },
];

export const DEFAULT_INITIAL_TIME = 600; // 10 minutes in seconds

export const STORAGE_KEY = 'antigravity-chess-game-v1';

export const AI_MOVE_DELAY = 600; // Natural delay in ms to make the AI feel human
