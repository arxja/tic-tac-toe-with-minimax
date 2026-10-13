import type { Board, Player } from "./types";

export const emptyBoard = (): Board => Array(9).fill(null);

const LINES: readonly number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // rows
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // cols
  [0, 4, 8],
  [2, 4, 6], // diags
];

export function getWinner(b: Board): Player | null {
  const line = getWinningLine(b);
  return line === null ? null : (b[line[0]] as Player);
}

export function getWinningLine(b: Board): number[] | null {
  for (const line of LINES) {
    const [a, c, d] = line;
    const v = b[a];
    if (v !== null && v === b[c] && v === b[d]) return line;
  }
  return null;
}

export function isFull(b: Board): boolean {
  return b.every((c) => c !== null);
}

export function emptyCells(b: Board): number[] {
  const out: number[] = [];
  for (let i = 0; i < b.length; i++) if (b[i] === null) out.push(i);
  return out;
}

export function applyMove(b: Board, i: number, p: Player): Board {
  if (i < 0 || i >= b.length)
    throw new Error(`applyMove: index ${i} out of range`);
  if (b[i] !== null)
    throw new Error(`applyMove: cell ${i} is already occupied`);
  const next = b.slice();
  next[i] = p;
  return next;
}
