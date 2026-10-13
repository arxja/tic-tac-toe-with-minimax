// Scores are ALWAYS from the AI's perspective.
//   AI wins  -> positive (larger = faster win)
//   Human wins -> negative (larger = slower loss)
//   Draw -> 0
// Consequence: the AI always takes max, the human always takes min.
// Do not flip this based on "who is trying to win" — it's a single rule.

import type { Board, Player } from "./types";
import { other } from "./types";
import { getWinner, isFull, emptyCells, applyMove } from "./game";

export const AI: Player = "O";
export const HUMAN: Player = "X";

/**
 * Value of `board` to the AI, assuming `toMove` plays next.
 * Always from the AI's perspective — not the mover's.
 */
// Memo key is (position, toMove). depth is implied by piece count on the board,
// NOT by path length. Same board -> same piece count -> same depth.
// If you ever add a rule that removes pieces (captures, etc.), you MUST add
// depth to the key or the memo will silently return wrong scores.
const memo = new Map<string, number>();

function key(b: Board, toMove: Player): string {
  // 9 chars for cells ('-' for empty) + 1 for whose turn
  let s = "";
  for (const c of b) s += c ?? "-";
  return s + toMove;
}

export function minimax(b: Board, toMove: Player, depth: number): number {
  const winner = getWinner(b);
  if (winner === AI) return 10 - depth;
  if (winner === HUMAN) return depth - 10;
  if (isFull(b)) return 0;

  const k = key(b, toMove);
  const cached = memo.get(k);
  if (cached !== undefined) return cached;

  const scores = emptyCells(b).map((i) =>
    minimax(applyMove(b, i, toMove), other(toMove), depth + 1),
  );

  const value = toMove === AI ? Math.max(...scores) : Math.min(...scores);
  memo.set(k, value);
  return value;
}
// Center, then corners, then edges. Purely a tie-break — minimax decides the score.
const CELL_PRIORITY = [4, 0, 2, 6, 8, 1, 3, 5, 7] as const;

export function bestMove(b: Board, ai: Player = AI): number {
  const human = other(ai);
  const ordered = CELL_PRIORITY.filter((i) => b[i] === null);
  if (ordered.length === 0) throw new Error("bestMove: no moves available");

  let bestScore = -Infinity;
  let best = ordered[0];

  for (const i of ordered) {
    const score = minimax(applyMove(b, i, ai), human, 1);
    if (score > bestScore) {
      // strict >, so first in priority wins ties
      bestScore = score;
      best = i;
    }
  }
  return best;
}
