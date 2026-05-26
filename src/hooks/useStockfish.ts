import { useEffect, useRef, useState, useCallback } from 'react';

export const useStockfish = () => {
  const workerRef = useRef<Worker | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const onBestMoveRef = useRef<((move: string) => void) | null>(null);

  // Initialize Web Worker
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      // Create a Blob that imports Stockfish from CDN and wraps the engine communications.
      // stockfish.js v10 exposes STOCKFISH() which returns an engine with postMessage/onmessage.
      // The engine's onmessage receives a plain string (not a MessageEvent).
      const workerCode = `
        try {
          importScripts("https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js");
        } catch(e) {
          self.postMessage("info string Failed to load Stockfish CDN: " + e.message);
        }
        
        var engine = null;
        if (typeof STOCKFISH === 'function') {
          engine = STOCKFISH();
        }
        
        if (engine) {
          engine.onmessage = function(line) {
            // The engine's onmessage receives a plain string, not a MessageEvent
            self.postMessage(line);
          };
          
          self.onmessage = function(event) {
            if (engine) {
              engine.postMessage(event.data);
            }
          };
        } else {
          self.postMessage("info string Stockfish engine could not be initialized.");
        }
      `;

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      const worker = new Worker(workerUrl);

      worker.onmessage = (event: MessageEvent) => {
        const line = event.data;

        if (typeof line !== 'string') return;

        if (line.startsWith('bestmove')) {
          setIsThinking(false);
          const parts = line.split(' ');
          const bestMove = parts[1]; // e.g. "e2e4" or "e7e8q"
          
          if (bestMove && onBestMoveRef.current) {
            onBestMoveRef.current(bestMove);
            onBestMoveRef.current = null;
          }
        }
      };

      worker.onerror = (err) => {
        console.error('Stockfish worker error:', err);
      };

      // Initialize UCI protocol
      worker.postMessage('uci');
      worker.postMessage('isready');

      workerRef.current = worker;

      return () => {
        worker.terminate();
        URL.revokeObjectURL(workerUrl);
      };
    } catch (error) {
      console.error('Failed to initialize Stockfish worker:', error);
    }
  }, []);

  /**
   * Request Stockfish to calculate the best move for a given position and depth.
   */
  const getBestMove = useCallback((fen: string, depth: number, onBestMove: (move: string) => void) => {
    const worker = workerRef.current;
    if (!worker) {
      console.warn('Stockfish worker is not initialized.');
      return;
    }

    setIsThinking(true);
    onBestMoveRef.current = onBestMove;

    // Map search depth to appropriate Stockfish Skill Level UCI options
    // Easy (Depth 1) -> Skill Level 0 (Novice, plays basic blunder-prone moves)
    // Medium (Depth 5) -> Skill Level 5 (Casual, moderate play style)
    // Hard (Depth 10) -> Skill Level 12 (Challenger, solid yet beatable ELO)
    let skillLevel = 20;
    if (depth <= 1) {
      skillLevel = 0;
    } else if (depth <= 5) {
      skillLevel = 5;
    } else {
      skillLevel = 12;
    }

    // Send skill level option setting to Stockfish
    worker.postMessage(`setoption name Skill Level value ${skillLevel}`);

    // Reset engine state and send new game position
    worker.postMessage('ucinewgame');
    worker.postMessage(`position fen ${fen}`);
    worker.postMessage(`go depth ${depth}`);
  }, []);

  /**
   * Cancel any active engine calculations
   */
  const stopCalculation = useCallback(() => {
    const worker = workerRef.current;
    if (worker) {
      worker.postMessage('stop');
      setIsThinking(false);
      onBestMoveRef.current = null;
    }
  }, []);

  return {
    getBestMove,
    stopCalculation,
    isThinking,
  };
};
