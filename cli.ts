import * as readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import type { Board, Player } from "./src/types";
import { other } from "./src/types";
import {
  emptyBoard,
  applyMove,
  getWinner,
  getWinningLine,
  isFull,
  emptyCells,
} from "./src/game";
import { bestMove, randomMove } from "./src/ai";

const HUMAN: Player = "X";
const AI: Player = "O";

type Difficulty = "easy" | "medium" | "hard";

const args = process.argv.slice(2);
const randomize = args.includes("--random");
const diffArg = args.find((a) => a.startsWith("--difficulty="));
const difficulty: Difficulty = (diffArg?.split("=")[1] as Difficulty) ?? "hard";

if (!["easy", "medium", "hard"].includes(difficulty)) {
  console.error(
    `Unknown difficulty: ${difficulty}. Use easy, medium, or hard.`,
  );
  process.exit(1);
}

function render(b: Board): string {
  const cell = (i: number) => b[i] ?? String(i); // show index if empty
  return [
    ` ${cell(0)} | ${cell(1)} | ${cell(2)} `,
    `---+---+---`,
    ` ${cell(3)} | ${cell(4)} | ${cell(5)} `,
    `---+---+---`,
    ` ${cell(6)} | ${cell(7)} | ${cell(8)} `,
  ].join("\n");
}

function parseMove(input: string, b: Board): number | null {
  const trimmed = input.trim();
  if (!/^[0-8]$/.test(trimmed)) return null;
  const i = Number(trimmed);
  return b[i] === null ? i : null;
}

function chooseAiMove(board: Board): number {
  if (difficulty === "easy") return randomMove(board);
  if (difficulty === "medium") {
    return Math.random() < 0.5
      ? randomMove(board)
      : bestMove(board, AI, randomize);
  }
  return bestMove(board, AI, randomize);
}

async function promptMove(rl: readline.Interface, b: Board): Promise<number> {
  while (true) {
    const answer = await rl.question("Your move (0-8): ");
    const move = parseMove(answer, b);
    if (move !== null) return move;
    console.log("Invalid move. Enter a digit 0-8 for an empty cell.");
  }
}

function describeResult(b: Board): string {
  const w = getWinner(b);
  if (w === HUMAN)
    return "You win! (this should never happen against perfect play)";
  if (w === AI) return "AI wins.";
  if (isFull(b)) return "Draw.";
  return "In progress";
}

async function playGame(rl: readline.Interface): Promise<void> {
  let board = emptyBoard();

  console.log("\nNew game. You are X, AI is O.\n");
  console.log(render(board));
  console.log();

  while (true) {
    // Human's turn
    const humanMove = await promptMove(rl, board);
    board = applyMove(board, humanMove, HUMAN);
    console.log("\n" + render(board) + "\n");

    if (getWinner(board) || isFull(board)) break;

    // AI's turn
    const aiMove = chooseAiMove(board);
    board = applyMove(board, aiMove, AI);
    console.log(`AI plays ${aiMove}.\n`);
    console.log(render(board) + "\n");

    if (getWinner(board) || isFull(board)) break;
  }

  console.log(describeResult(board));

  const line = getWinningLine(board);
  if (line) console.log(`Winning line: ${line.join(",")}`);
}

async function main(): Promise<void> {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  try {
    while (true) {
      console.log(
        `\nNew game. You are X, AI is O. (difficulty: ${difficulty}${randomize ? ", randomized ties" : ""})\n`,
      );
      await playGame(rl);
      const again = (await rl.question("\nPlay again? (y/n): "))
        .trim()
        .toLowerCase();
      if (again !== "y") break;
    }
    console.log("Thanks for playing.");
  } finally {
    rl.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
