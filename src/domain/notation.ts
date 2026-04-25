/**
 * Algebraic Notation utilities
 * Converts moves to Standard Algebraic Notation (SAN) for display and PGN
 */

import { Move, PositionState, Color, Square, Piece } from "./types";
import { indexToCoord } from "./board";
import { getGameStatus } from "./rules";

const PIECE_LETTERS: Record<string, string> = {
  pawn: "",
  rook: "R",
  knight: "N",
  bishop: "B",
  queen: "Q",
  king: "K",
};

/**
 * Convert a square index to algebraic notation (e.g., 0 -> 'a1')
 */
export function squareToAlgebraic(square: Square): string {
  const [row, col] = indexToCoord(square);
  return String.fromCharCode(97 + col) + (row + 1);
}

/**
 * Convert a move to Standard Algebraic Notation (SAN)
 */
export function moveToSan(
  move: Move,
  position: PositionState,
  legalMoves?: Move[],
): string {
  const { board } = position.boardState;
  const piece = board[move.from];
  if (!piece) return "???";

  // Castling
  if (move.isCastling) {
    return move.to > move.from ? "O-O" : "O-O-O";
  }

  let san = "";

  // Piece letter (not for pawns)
  if (piece.type !== "pawn") {
    san += PIECE_LETTERS[piece.type];

    // Disambiguation: if multiple pieces of same type can reach the same square
    if (legalMoves) {
      const ambiguous = legalMoves.filter(
        (m) =>
          m.to === move.to &&
          m.from !== move.from &&
          board[m.from]?.type === piece.type &&
          board[m.from]?.color === piece.color,
      );
      if (ambiguous.length > 0) {
        const [fromRow, fromCol] = indexToCoord(move.from);
        const sameFile = ambiguous.some(
          (m) => indexToCoord(m.from)[1] === fromCol,
        );
        const sameRank = ambiguous.some(
          (m) => indexToCoord(m.from)[0] === fromRow,
        );
        if (!sameFile) {
          san += String.fromCharCode(97 + fromCol);
        } else if (!sameRank) {
          san += fromRow + 1;
        } else {
          san += squareToAlgebraic(move.from);
        }
      }
    }
  }

  // Capture
  if (move.isCapture || move.isEnPassant) {
    if (piece.type === "pawn") {
      san += String.fromCharCode(97 + indexToCoord(move.from)[1]);
    }
    san += "x";
  }

  // Destination square
  san += squareToAlgebraic(move.to);

  // Promotion
  if (move.promotion) {
    san += "=" + PIECE_LETTERS[move.promotion];
  }

  return san;
}

/**
 * Format a move with check/checkmate suffix
 */
export function formatMove(
  move: Move,
  position: PositionState,
  resultPosition?: PositionState,
  legalMoves?: Move[],
): string {
  let san = moveToSan(move, position, legalMoves);

  if (resultPosition) {
    const status = getGameStatus(resultPosition);
    if (status === "checkmate") {
      san += "#";
    } else if (status === "check") {
      san += "+";
    }
  }

  return san;
}
