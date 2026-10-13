import { describe, it, expect } from "vitest";
import { minimax, bestMove, AI, HUMAN } from "../src/ai";
import { applyMove, emptyBoard, getWinner, isFull } from "../src/game";
import { other, type Board, type Player } from "../src/types";

const b = (s: string): Board =>
  s.split("").map((c) => (c === "X" || c === "O" ? c : null));

describe("bestMove — canonical cases", () => {
  it("completes its own line to win", () => {
    // O O .     AI=O, can play 2 to win row 0
    // X X .
    // . . .
    const board = b("OO.XX....");
    expect(bestMove(board)).toBe(2);
  });

  it("blocks the human from winning", () => {
    // X X .     AI must play 2 to block
    // O . .
    // . . .
    const board = b("XX.O.....");
    expect(bestMove(board)).toBe(2);
  });

  it("prefers a win over a block when both exist", () => {
    // O O .     AI can win at 2 (row 0) or block X at 5 — must win
    // X X .
    // . . .
    const board = b("OO.XX....");
    expect(bestMove(board)).toBe(2);
  });

  it("opens in the center on an empty board", () => {
    expect(bestMove(emptyBoard())).toBe(4);
  });

  it("prefers a faster win (depth weighting)", () => {
    // O O .     winning now at 2 beats setting up a slower win
    // . . .
    // . . .
    expect(bestMove(b("OO......."))).toBe(2);
  });
});

describe("bestMove — never loses", () => {
  function playout(
    humanChooser: (b: Board) => number,
  ): "human" | "ai" | "draw" {
    let board = emptyBoard();
    let turn: Player = "X";

    while (true) {
      const w = getWinner(board);
      if (w === "X") return "human";
      if (w === "O") return "ai";
      if (isFull(board)) return "draw";

      const move = turn === "O" ? bestMove(board) : humanChooser(board);
      board = applyMove(board, move, turn);
      turn = other(turn);
    }
  }

  const randomChoice = (board: Board): number => {
    const empties = board
      .map((c, i) => (c === null ? i : -1))
      .filter((i) => i >= 0);
    return empties[Math.floor(Math.random() * empties.length)];
  };

  const greedy = (board: Board): number => {
    if (board[4] === null) return 4;
    return board.findIndex((c) => c === null);
  };

  it("never loses to a random opponent (500 games)", () => {
    for (let g = 0; g < 500; g++) {
      expect(playout(randomChoice)).not.toBe("human");
    }
  });

  it("never loses to center-first greedy", () => {
    expect(playout(greedy)).not.toBe("human");
  });
});

describe("minimax — values", () => {
  it("returns 0 for a full drawn board", () => {
    // X O X
    // X O O
    // O X X   -> no winner, full
    const draw = b("XOXXOOOXX");
    expect(getWinner(draw)).toBeNull();
    expect(minimax(draw, "X", 0)).toBe(0);
  });

  it("is positive for an AI win, negative for a human win", () => {
    expect(minimax(b("OOO......"), "X", 0)).toBeGreaterThan(0); // AI=O already won
    expect(minimax(b("XXX......"), "O", 0)).toBeLessThan(0); // human won
  });
});
