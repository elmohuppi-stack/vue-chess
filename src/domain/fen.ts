/**
 * FEN (Forsyth-Edwards Notation) serialization and parsing
 * Used for position setup, testing, and storage
 */

import {
  PositionState,
  BoardState,
  GameMetaState,
  Color,
  Square,
  CastlingRights,
  Piece,
} from "./types";
import { createInitialPosition } from "./gameState";

const PIECE_TO_FEN: Record<string, string> = {
  pawn: "p",
  rook: "r",
  knight: "n",
  bishop: "b",
  queen: "q",
  king: "k",
};

const FEN_TO_PIECE: Record<string, { type: string; color: Color }> = {};
for (const [type, fen] of Object.entries(PIECE_TO_FEN)) {
  FEN_TO_PIECE[fen] = { type, color: Color.Black };
  FEN_TO_PIECE[fen.toUpperCase()] = { type, color: Color.White };
}

/**
 * Serialize a position to FEN string
 */
export function positionToFen(position: PositionState): string {
  const { board } = position.boardState;
  const meta = position.metaState;
  let fen = "";

  // Board layout (ranks 8 to 1)
  for (let rank = 7; rank >= 0; rank--) {
    let emptyCount = 0;
    for (let file = 0; file < 8; file++) {
      const idx = rank * 8 + file;
      const piece = board[idx];
      if (!piece) {
        emptyCount++;
      } else {
        if (emptyCount > 0) {
          fen += emptyCount;
          emptyCount = 0;
        }
        const symbol = PIECE_TO_FEN[piece.type];
        fen += piece.color === Color.White ? symbol.toUpperCase() : symbol;
      }
    }
    if (emptyCount > 0) fen += emptyCount;
    if (rank > 0) fen += "/";
  }

  // Active color
  fen += " " + (meta.activeColor === Color.White ? "w" : "b");

  // Castling rights
  const cr = meta.castlingRights;
  let castling = "";
  if (cr.whiteKingside) castling += "K";
  if (cr.whiteQueenside) castling += "Q";
  if (cr.blackKingside) castling += "k";
  if (cr.blackQueenside) castling += "q";
  fen += " " + (castling || "-");

  // En-passant target
  fen += " " + (meta.enPassantTarget !== null ? squareToAlgebraic(meta.enPassantTarget) : "-");

  // Halfmove clock
  fen += " " + meta.halfmoveClock;

  // Fullmove number
  fen += " " + meta.fullmoveNumber;

  return fen;
}

/**
 * Parse a FEN string to PositionState
 */
export function fenToPosition(fen: string): PositionState {
  const parts = fen.trim().split(/\s+/);
  if (parts.length < 4) {
    throw new Error(`Invalid FEN: "${fen}" – need at least 4 parts`);
  }

  const boardLayout = parts[0];
  const activeColor = parts[1];
  const castlingStr = parts[2];
  const enPassantStr = parts[3];
  const halfmoveClock = parts.length > 4 ? parseInt(parts[4]) : 0;
  const fullmoveNumber = parts.length > 5 ? parseInt(parts[5]) : 1;

  // Parse board
  const board: (Piece | null)[] = new Array(64).fill(null);
  const ranks = boardLayout.split("/");
  if (ranks.length !== 8) {
    throw new Error(`Invalid FEN board: expected 8 ranks, got ${ranks.length}`);
  }

  for (let rank = 0; rank < 8; rank++) {
    let file = 0;
    for (const char of ranks[7 - rank]) {
      if (char >= "1" && char <= "8") {
        file += parseInt(char);
      } else {
        const piece = FEN_TO_PIECE[char];
        if (!piece) {
          throw new Error(`Invalid FEN character: "${char}"`);
        }
        board[rank * 8 + file] = { type: piece.type as any, color: piece.color };
        file++;
      }
    }
  }

  // Parse castling rights
  const castlingRights: CastlingRights = {
    whiteKingside: castlingStr.includes("K"),
    whiteQueenside: castlingStr.includes("Q"),
    blackKingside: castlingStr.includes("k"),
    blackQueenside: castlingStr.includes("q"),
  };

  // Parse en-passant
  let enPassantTarget: Square | null = null;
  if (enPassantStr !== "-") {
    enPassantTarget = algebraicToSquare(enPassantStr);
  }

  return {
    boardState: { board },
    metaState: {
      activeColor: activeColor === "w" ? Color.White : Color.Black,
      castlingRights,
      enPassantTarget,
      halfmoveClock,
      fullmoveNumber,
    },
  };
}

/**
 * Convert square index to algebraic notation (e.g., 0 -> 'a1')
 */
function squareToAlgebraic(square: Square): string {
  const file = square % 8;
  const rank = Math.floor(square / 8);
  return String.fromCharCode(97 + file) + (rank + 1);
}

/**
 * Convert algebraic notation to square index (e.g., 'a1' -> 0)
 */
function algebraicToSquare(notation: string): Square {
  const file = notation.charCodeAt(0) - 97;
  const rank = parseInt(notation[1]) - 1;
  return (rank * 8 + file) as Square;
}

/**
 * Get FEN for the starting position
 */
export function getInitialFen(): string {
  return "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
}
