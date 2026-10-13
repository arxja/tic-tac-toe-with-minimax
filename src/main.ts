import "./style.css";
import type { Board, Player } from "./types";
import { other } from "./types";
import {
  emptyBoard,
  applyMove,
  getWinner,
  getWinningLine,
  isFull,
} from "./game";
import { bestMove } from "./ai";

const HUMAN: Player = "X";
const AI: Player = "O";
const AI_DELAY_MS = 300;

// ─── State ──────────────────────────────────────────────────
let board: Board = emptyBoard();
let turn: Player = HUMAN;
let isThinking = false;
let winner: Player | null = null;
let winningLine: number[] | null = null;

// ─── DOM setup (once) ───────────────────────────────────────
const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
  <h1>Tic Tac Toe</h1>
  <div id="status" class="status"></div>
  <div id="board" class="board"></div>
  <button id="reset" class="reset">Reset</button>
`;

const statusEl = document.querySelector<HTMLDivElement>("#status")!;
const boardEl = document.querySelector<HTMLDivElement>("#board")!;
const resetEl = document.querySelector<HTMLButtonElement>("#reset")!;

// Build the 9 buttons once. We only update their contents on render.
const cellEls: HTMLButtonElement[] = [];
for (let i = 0; i < 9; i++) {
  const btn = document.createElement("button");
  btn.className = "cell";
  btn.addEventListener("click", () => onCellClick(i));
  boardEl.appendChild(btn);
  cellEls.push(btn);
}

// ─── Actions ────────────────────────────────────────────────
function reset(): void {
  board = emptyBoard();
  turn = HUMAN;
  isThinking = false;
  winner = null;
  winningLine = null;
  render();
}

function onCellClick(i: number): void {
  if (isThinking) return;
  if (winner !== null) return;
  if (turn !== HUMAN) return;
  if (board[i] !== null) return;

  board = applyMove(board, i, HUMAN);
  advanceTurn();
}

function advanceTurn(): void {
  const w = getWinner(board);
  if (w !== null) {
    winner = w;
    winningLine = getWinningLine(board);
    render();
    return;
  }
  if (isFull(board)) {
    render();
    return;
  }

  turn = other(turn);

  if (turn === AI) {
    isThinking = true;
    render();
    setTimeout(playAiTurn, AI_DELAY_MS);
  } else {
    render();
  }
}

function playAiTurn(): void {
  const move = bestMove(board, AI);
  board = applyMove(board, move, AI);
  isThinking = false;
  advanceTurn();
}

// ─── Render ─────────────────────────────────────────────────
function render(): void {
  for (let i = 0; i < 9; i++) {
    const el = cellEls[i];
    el.textContent = board[i] ?? "";
    el.classList.toggle("x", board[i] === "X");
    el.classList.toggle("o", board[i] === "O");
    el.classList.toggle("win", winningLine?.includes(i) ?? false);
    el.disabled = board[i] !== null || isThinking || winner !== null;
  }

  if (winner === HUMAN) statusEl.textContent = "You win!";
  else if (winner === AI) statusEl.textContent = "AI wins.";
  else if (isFull(board)) statusEl.textContent = "It's a draw.";
  else if (isThinking) statusEl.textContent = "AI is thinking…";
  else statusEl.textContent = turn === HUMAN ? "Your turn (X)" : "AI turn (O)";
}

// ─── Wiring ─────────────────────────────────────────────────
resetEl.addEventListener("click", reset);
render();
