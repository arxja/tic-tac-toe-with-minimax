import { describe, it, expect } from "vitest";
import {
  emptyBoard,
  getWinner,
  getWinningLine,
  isFull,
  emptyCells,
  applyMove,
} from "../src/game";
import type { Board } from "../src/types";

// "XO..X...." -> ['X','O',null,null,'X',null,null,null,null]
const b = (s: string): Board =>
  s.split("").map((c) => (c === "X" || c === "O" ? c : null));

describe("emptyBoard", () => {
  it("is 9 nulls", () => {
    expect(emptyBoard()).toEqual(Array(9).fill(null));
  });
});

describe("getWinner", () => {
  it("returns null on empty board", () => {
    expect(getWinner(emptyBoard())).toBeNull();
  });

  const lines: Array<[string, number[]]> = [
    ["XXX......", [0, 1, 2]],
    ["...XXX...", [3, 4, 5]],
    ["......XXX", [6, 7, 8]],
    ["X..X..X..", [0, 3, 6]],
    [".X..X..X.", [1, 4, 7]],
    ["..X..X..X", [2, 5, 8]],
    ["X...X...X", [0, 4, 8]],
    ["..X.X.X..", [2, 4, 6]],
  ];

  for (const [board, line] of lines) {
    it(`detects X on ${line.join(",")}`, () => {
      expect(getWinner(b(board))).toBe("X");
      expect(getWinningLine(b(board))).toEqual(line);
    });
  }

  it("detects O winning", () => {
    expect(getWinner(b("OOO......"))).toBe("O");
  });

  it("returns null when no line is complete (partial board)", () => {
    // X O .   no row, col, or diagonal has three in a row
    // . X .
    // O . .
    expect(getWinner(b("XO..X.O.."))).toBeNull();
    expect(getWinningLine(b("XO..X.O.."))).toBeNull();
  });

  it("returns null on a full board with no winner", () => {
    // strongest possible no-win case: board is full, still no line
    expect(getWinner(b("XOXXOOOXX"))).toBeNull();
  });

  it("does not confuse a full non-winning board for a win", () => {
    expect(getWinner(b("XOXXOOOXX"))).toBeNull();
  });

  it("when two lines complete at once, returns the first per LINES order", () => {
    // XOX.OX.OX -> col1 (O) is checked before col2 (X)
    expect(getWinner(b("XOX.OX.OX"))).toBe("O");
  });
});

describe("isFull / emptyCells", () => {
  it("empty board: not full, 9 empty", () => {
    expect(isFull(emptyBoard())).toBe(false);
    expect(emptyCells(emptyBoard())).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("full board: full, 0 empty", () => {
    const full = b("XOXXOOOXX");
    expect(isFull(full)).toBe(true);
    expect(emptyCells(full)).toEqual([]);
  });

  it("partial board", () => {
    const p = b("XO.......");
    expect(isFull(p)).toBe(false);
    expect(emptyCells(p)).toEqual([2, 3, 4, 5, 6, 7, 8]);
  });
});

describe("applyMove", () => {
  it("returns a new board with the move applied", () => {
    const before = emptyBoard();
    const after = applyMove(before, 4, "X");
    expect(after[4]).toBe("X");
    expect(before[4]).toBeNull(); // original untouched
    expect(after).not.toBe(before);
  });

  it("throws on an occupied cell", () => {
    expect(() => applyMove(b("X........"), 0, "O")).toThrow(/occupied/);
  });

  it("throws on out-of-range index", () => {
    expect(() => applyMove(emptyBoard(), -1, "X")).toThrow(/range/);
    expect(() => applyMove(emptyBoard(), 9, "X")).toThrow(/range/);
  });
});
