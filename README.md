# Tic Tac Toe with Minimax

A tic-tac-toe game with an unbeatable AI, built from scratch in TypeScript.
Play in the browser or in the terminal.

## What it does

- **Browser UI** with a difficulty selector (easy / medium / hard)
- **Terminal UI** for headless play
- **AI** uses minimax with memoization; on hard, it never loses
- **Tests** cover game logic and prove the AI can't be beaten

## Stack

- TypeScript + Vite
- Vitest for tests
- Zero runtime dependencies

## Structure

```text
    src/
      types.ts    — Player, Cell, Board, and helpers
      game.ts     — pure game rules (no AI, no DOM)
      ai.ts       — minimax + memoization + difficulty policies
      main.ts     — browser UI (DOM shell)
    test/
      game.test.ts — rules, line detection, move application
      ai.test.ts   — bestMove behavior, never-loses simulation
    cli.ts        — terminal UI (readline shell)
```

## Architecture

Everything hinges on one split: **pure logic in the leaves, shells around it.**

`game.ts` and `ai.ts` import nothing from the DOM or from Node. They take
values, return values, and have no side effects. That's what makes them:

- Testable without mocks
- Reusable across the browser UI, CLI, and tests
- Provably correct (see the "never loses" simulation test)

The two shells (`main.ts`, `cli.ts`) differ only in:

1. How they get the human's move
2. How they render the board

The game loop itself is identical, and it lives in the pure layer.

## Running

```bash
    pnpm install
    pnpm dev     # browser
    pnpm play    # terminal
    pnpm test    # tests
```

## What I learned

- **Immutability by default.** `readonly Board` + `applyMove` returning a new
  board eliminates a whole class of mutation bugs, especially in the recursion.

- **Minimax is about signs.** Scores are always from the AI's perspective.
  AI wins → positive, human wins → negative. The AI always takes the max, the
  human always takes the min. One rule, both branches.

- **Depth weighting matters.** Without `10 - depth`, the AI is still unbeatable
  but plays randomly among equally-winning moves — feels broken.

- **Memoization turns exponential into instant.** Board position + player to
  move is a safe key because depth is implied by piece count. A 500-game
  simulation went from timeout to sub-second.

- **Tests fail for three reasons, in this order:** the test is wrong, the code
  is wrong, the environment is wrong. Check #1 first. My first two "AI bugs"
  were both test bugs.

- **Policy vs mechanism.** Difficulty levels change how the AI picks among
  moves, not how it evaluates them. One engine, three policies.

## What's next (if anything)

- 4×4 board with alpha-beta pruning (where minimax stops being trivial)
- Score tracking in `localStorage`
- Online multiplayer (a separate project — server-authoritative state)
