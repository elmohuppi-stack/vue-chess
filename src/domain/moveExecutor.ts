/**
 * Move execution - applies a move to a position state
 * Returns a new position state (immutable)
 */

import { Move, PositionState, Color, MoveResult, Square } from "./types";
import { clonePositionState, toggleActiveColor } from "./gameState";
import { coordToIndex, indexToCoord, BOARD_SIZE } from "./board";

/**
 * Apply a move to the current position
 * Returns new position state and validation result
 */
export function applyMove(position: PositionState, move: Move): MoveResult {
  try {
    const newPosition = clonePositionState(position);
    const { board } = newPosition.boardState;
    const { metaState } = newPosition;

    const piece = board[move.from];
    if (!piece) {
      return { success: false, message: "No piece to move" };
    }

    // Handle castling
    if (move.isCastling) {
      return applyCastlingMove(newPosition, move);
    }

    // Handle en-passant
    if (move.isEnPassant) {
      const [toRow, toCol] = indexToCoord(move.to);
      const captureRow = indexToCoord(move.from)[0];
      const captureIndex = coordToIndex(captureRow, toCol) as Square;
      board[captureIndex] = null;
    }

    // Move piece
    board[move.to] = piece;
    board[move.from] = null;

    // Handle pawn promotion
    if (move.promotion) {
      board[move.to] = { ...piece, type: move.promotion };
    }

    // Update meta state
    updateMetaState(newPosition, move, piece);

    return { success: true, newPosition };
  } catch (error) {
    return { success: false, message: String(error) };
  }
}

/**
 * Apply castling move
 */
function applyCastlingMove(position: PositionState, move: Move): MoveResult {
  const { board } = position.boardState;
  const piece = board[move.from];

  if (!piece || piece.type !== "king") {
    return { success: false, message: "Invalid castling: no king" };
  }

  // Move king
  board[move.to] = piece;
  board[move.from] = null;

  // Move rook
  const isKingside = move.to > move.from;
  if (isKingside) {
    // Kingside castling
    const rookFrom = move.from + 3;
    const rookTo = move.from + 1;
    const rook = board[rookFrom];
    if (rook && rook.type === "rook") {
      board[rookTo] = rook;
      board[rookFrom] = null;
    }
  } else {
    // Queenside castling
    const rookFrom = move.from - 4;
    const rookTo = move.from - 1;
    const rook = board[rookFrom];
    if (rook && rook.type === "rook") {
      board[rookTo] = rook;
      board[rookFrom] = null;
    }
  }

  // Update meta state
  updateMetaState(position, move, piece);

  return { success: true, newPosition: position };
}

/**
 * Update meta state after move
 */
function updateMetaState(
  position: PositionState,
  move: Move,
  piece: any,
): void {
  const { metaState } = position;

  // Update active color
  metaState.activeColor = toggleActiveColor(metaState.activeColor);

  // Update en-passant target
  if (move.isDoubleStep && piece.type === "pawn") {
    const [fromRow] = indexToCoord(move.from);
    const enPassantRow = fromRow + (piece.color === Color.White ? 1 : -1);
    const [, toCol] = indexToCoord(move.to);
    metaState.enPassantTarget = coordToIndex(enPassantRow, toCol) as Square;
  } else {
    metaState.enPassantTarget = null;
  }

  // Update castling rights
  updateCastlingRights(metaState, move, piece);

  // Update halfmove clock (50-move rule)
  if (piece.type === "pawn" || move.isCapture || move.isEnPassant) {
    metaState.halfmoveClock = 0;
  } else {
    metaState.halfmoveClock++;
  }

  // Update fullmove number
  if (metaState.activeColor === Color.White) {
    metaState.fullmoveNumber++;
  }
}

/**
 * Update castling rights after move
 */
function updateCastlingRights(metaState: any, move: Move, piece: any): void {
  const { castlingRights } = metaState;

  if (piece.type === "king") {
    if (piece.color === Color.White) {
      castlingRights.whiteKingside = false;
      castlingRights.whiteQueenside = false;
    } else {
      castlingRights.blackKingside = false;
      castlingRights.blackQueenside = false;
    }
  } else if (piece.type === "rook") {
    const [fromRow, fromCol] = indexToCoord(move.from);
    if (piece.color === Color.White) {
      if (fromRow === 0 && fromCol === 0) castlingRights.whiteQueenside = false;
      if (fromRow === 0 && fromCol === 7) castlingRights.whiteKingside = false;
    } else {
      if (fromRow === 7 && fromCol === 0) castlingRights.blackQueenside = false;
      if (fromRow === 7 && fromCol === 7) castlingRights.blackKingside = false;
    }
  }

  // Also check if rook is captured
  if (move.isCapture) {
    const [toRow, toCol] = indexToCoord(move.to);
    if (toRow === 0 && toCol === 0)
      metaState.castlingRights.whiteQueenside = false;
    if (toRow === 0 && toCol === 7)
      metaState.castlingRights.whiteKingside = false;
    if (toRow === 7 && toCol === 0)
      metaState.castlingRights.blackQueenside = false;
    if (toRow === 7 && toCol === 7)
      metaState.castlingRights.blackKingside = false;
  }
}
