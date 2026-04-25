/**
 * Core chess domain types and interfaces
 * Framework-independent chess logic definitions
 */

// ===== Color and Piece Types =====
export enum Color {
  White = "white",
  Black = "black",
}

export type PieceType =
  | "pawn"
  | "rook"
  | "knight"
  | "bishop"
  | "queen"
  | "king";

export interface Piece {
  type: PieceType;
  color: Color;
}

// ===== Board and Position Types =====
export type Square = number; // 0-63, where 0 is a1, 63 is h8

export type Board = (Piece | null)[]; // 64 squares

// ===== Move Types =====
export interface Move {
  from: Square;
  to: Square;
  promotion?: PieceType; // Only for pawn promotion
  isCapture: boolean;
  isCastling: boolean;
  isEnPassant: boolean;
  isDoubleStep?: boolean; // For pawn double move (used for en-passant tracking)
}

// ===== Game State Types =====
export interface BoardState {
  board: Board;
}

export interface GameMetaState {
  activeColor: Color;
  castlingRights: CastlingRights;
  enPassantTarget: Square | null; // null if no en-passant possible
  halfmoveClock: number; // 50-move rule
  fullmoveNumber: number;
}

export interface PositionState {
  boardState: BoardState;
  metaState: GameMetaState;
  hash?: number; // Zobrist hash placeholder for Phase 2
}

export interface CastlingRights {
  whiteKingside: boolean;
  whiteQueenside: boolean;
  blackKingside: boolean;
  blackQueenside: boolean;
}

// ===== Game Status Types =====
export enum GameStatus {
  Active = "active",
  Check = "check",
  Checkmate = "checkmate",
  Stalemate = "stalemate",
  Draw = "draw", // 50-move, threefold, insufficient material
}

export interface MoveResult {
  success: boolean;
  message?: string;
  newPosition?: PositionState;
}

// ===== Move History for PGN/UI =====
export interface HistoricalMove {
  move: Move;
  positionBefore: PositionState;
  positionAfter: PositionState;
  sanNotation?: string; // Standard Algebraic Notation (optional, generated later)
  timestamp?: number;
}

// ===== Game Context =====
export interface GameContext {
  moves: HistoricalMove[];
  currentPosition: PositionState;
  gameStatus: GameStatus;
  result?: "white" | "black" | "draw" | null;
}
