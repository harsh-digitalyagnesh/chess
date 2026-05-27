# 👑 CYBER CHESS — Premium Real-Time Stockfish Arena

Cyber Chess is a high-fidelity, interactive, and beautifully-designed Chess arena built with **Next.js**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**. Powered by the renowned **Stockfish.js chess engine** run asynchronously inside a background Web Worker, Cyber Chess offers responsive gameplay, professional board controls, and rich real-time programmatic audio effects.

Featuring a gorgeous dark theme with ambient emerald and teal glowing accents, Cyber Chess pairs you against a witty AI opponent (**Polly the Parrot** 🦜) with multiple difficulty presets, custom Blitz/Bullet timers, and a time-travel move browser.

---

## 🌟 Key Features

*   **🤖 Multi-Tiered Stockfish AI ("Polly" 🦜)**:
    *   **Easy (Depth 1)**: Maps to Stockfish Skill Level `0` (Novice, plays basic blunder-prone moves).
    *   **Medium (Depth 5)**: Maps to Stockfish Skill Level `5` (Casual, moderate play style).
    *   **Hard (Depth 10)**: Maps to Stockfish Skill Level `12` (Challenger, solid yet highly beatable ELO).
    *   *AI runs entirely off-thread inside a Web Worker, ensuring butter-smooth rendering.*
*   **🔊 Real-Time Client-Side Web Audio Synthesizer**: Programmatic client-side audio oscillator generates satisfying organic acoustic sounds for move, capture, castle, check, and game-over effects—completely eliminating physical audio asset load times and network overhead.
*   **🎹 Professional Keyboard Shortcuts**: Quick actions for seasoned players:
    *   `[F]`: Flip the Board
    *   `[U]`: Undo last move and AI response
    *   `[R]`: Restart current match
    *   `[H]`: View latest move position
    *   `[←]` / `[→]`: Time-travel browse move history
*   **⚡ Blitz, Bullet & Classical Timers**: Preset clocks (1 Min Bullet, 3 Min Blitz, 5 Min Blitz, 10 Min Rapid, 30 Min Classical) or Custom Infinite play options with automated time-forfeit detection.
*   **📊 Chess.com Style Profile Cards**: Displays active player clock, custom avatars, live captured piece lists, and material lead score indicator (plus rating crowns).
*   **🧠 Move History & Analysis Tools**: Browse fully interactive move history logs, import custom states using raw **FEN** strings, or export full game records to **PGN** clipboard format.
*   **💾 Persistent Cache Storage**: Auto-saves your active board layout, timers, configurations, and move logs in `localStorage` across page updates.

---

## 🏗️ Folder Architecture

```
src/
├── app/
│   ├── layout.tsx         # HTML shell, SEO meta tags, and Geist font family configuration
│   ├── globals.css        # Base Tailwind styling imports and customized scrollbars
│   └── page.tsx           # Chess Arena layout, bot select modal, and keyboard shortcut event listeners
├── components/
│   ├── chess/
│   │   ├── BotCard.tsx             # Witty speech dialogue balloon responding to game states
│   │   ├── CapturedPieces.tsx      # Inline lists of captured black & white pieces
│   │   ├── ChessBoard.tsx          # Wraps react-chessboard with legal moves & selection highlights
│   │   ├── DifficultySelector.tsx  # Simple difficulty preset selection indicators
│   │   ├── GameControls.tsx        # Restart, undo, export PGN, and import FEN control panel
│   │   ├── GameStatus.tsx          # Absolute verdict overlay (Checkmate, Draw, Stalemate, Timeout)
│   │   ├── MoveHistory.tsx         # Compact multi-column PGN-style move log
│   │   ├── PlayerProfileCard.tsx   # Adaptive header/footer profile with timers & captured indicators
│   │   └── Timer.tsx               # High-contrast reactive countdown clock
│   └── layout/
│       └── Navbar.tsx              # Minimalist branding header
├── hooks/
│   ├── useChessGame.ts    # Central core state manager, localStorage caching, and sound routing
│   └── useStockfish.ts    # Web Worker manager that imports and configures Stockfish.js engine via CDN
├── store/
│   └── gameStore.tsx      # React context provider and global store hooks
├── types/
│   └── chess.ts           # Unified TypeScript definitions for moves, profiles, states, and timers
└── utils/
    ├── chessHelpers.ts    # Material advantage calculations, FEN validator, and digital timer parser
    ├── constants.ts       # Preset chess values, depth numbers, storage keys, and delay intervals
    └── sounds.ts          # Synthesizes organic wooden piece sounds entirely via Web Audio API
```

---

## 🚀 Getting Started

### 📦 Installation

Clone this repository and install all project dependencies:

```bash
# Navigate to project directory
cd "c:\Harsh\Games\Chess"

# Install package dependencies
npm install
```

### 💻 Launch Development Server

Run the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) inside your favorite browser to access the Chess Arena.

### 🏗️ Compiling Production Build

To build and compile highly optimized production bundles:

```bash
# Compile and check TypeScript types
npm run build

# Start production server locally
npm run start
```

---

## 🧠 Algorithmic Deep Dive

### Stockfish.js Engine & Web Workers
To prevent blocking the main rendering thread during complex chess computations, the engine runs inside a dedicated background **Web Worker**.

1.  **Initialization**: The worker dynamically imports the Stockfish.js script from a high-performance CDN inside `src/hooks/useStockfish.ts`.
2.  **Communication**: Communication relies on the standard **UCI (Universal Chess Interface)** protocol. The app posts commands to the worker thread:
    *   `setoption name Skill Level value [0-20]`
    *   `ucinewgame`
    *   `position fen [Current FEN]`
    *   `go depth [Target Depth]`
3.  **Result Retrieval**: The worker listens for output lines, matching `bestmove` strings (e.g. `bestmove e2e4`) and parses the coordinates to update the `chess.js` board instance.

---

## 🔊 Audio Synthesis Architecture

The synthesizer in `src/utils/sounds.ts` utilizes the HTML5 **Web Audio API** to dynamically construct organic audio waves in the client browser, bypassing physical audio asset loading entirely:

*   **Move Sound (`move`)**: Generates a warm, wood-like "plop" by sliding a `sine` wave frequency rapidly downwards (`190Hz → 75Hz` over `80ms`) passed through a low-pass filter to eliminate high harmonics.
*   **Capture Sound (`capture`)**: Simulates a snappy wooden crack by playing a `triangle` wave combined with a frequency-filtered, detuned `sawtooth` wave (`1500Hz → 100Hz`) to mimic piece-on-piece collision.
*   **Castle Sound (`castle`)**: Plays a dual-move sequence where the King plops first, followed by the Rook plopping at a slightly higher pitch `110ms` later.
*   **Check Sound (`check`)**: Triggers two detuned, high-pitched `triangle` waves (`520Hz` & `524Hz`) ramping slightly upwards to form a highly audible alert chime.
*   **Game Over Sound (`gameover`)**: Sweeps a slow-decaying, descending major-minor triad chord (`A3, C#4, E4, A4` from `220Hz` to `440Hz`) with a smooth attack slope and a gentle `1.2s` decay fade-out.
