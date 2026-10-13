export type Player = "X" | "O";
export type Cell = Player | null;
export type Board = readonly Cell[];

export const other = (p: Player): Player => (p === "X" ? "O" : "X");
