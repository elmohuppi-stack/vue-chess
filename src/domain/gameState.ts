/**
 * Game state management and separation
 * Combines and separates BoardState and GameMetaState
 */

import {
  BoardState,
  GameMetaState,
  PositionState,
  Color,
  CastlingRights,
  Square,
} from "./types";

/**
 * Create initial board state (standard chess starting position)
 */
export function createInitialBoardState(): BoardState {
  const board = new Array(64).fill(null);

  // Place white pieces
  board[0] = { type: "rook", color: Color.White };
  board[1] = { type: "knight", color: Color.White };
  board[2] = { type: "bishop", color: Color.White };
  board[3] = { type: "queen", color: Color.White };
  board[4] = { type: "king", color: Color.White };
  board[5] = { type: "bishop", color: Color.White };
  board[6] = { type: "knight", color: Color.White };
  board[7] = { type: "rook", color: Color.White };

  for (let i = 8; i < 16; i++) {
    board[i] = { type: "pawn", color: Color.White };
  }

  // Place black pieces
  for (let i = 48; i < 56; i++) {
    board[i] = { type: "pawn", color: Color.Black };
  }

  board[56] = { type: "rook", color: Color.Black };
  board[57] = { type: "knight", color: Color.Black };
  board[58] = { type: "bishop", color: Color.Black };
  board[59] = { type: "queen", color: Color.Black };
  board[60] = { type: "king", color: Color.Black };
  board[61] = { type: "bishop", color: Color.Black };
  board[62] = { type: "knight", color: Color.Black };
  board[63] = { type: "rook", color: Color.Black };

  return { board };
}

/**
 * Create initial meta state (castling rights, no en-passant, etc.)
 */
export function createInitialMetaState(): GameMetaState {
  return {
    activeColor: Color.White,
    castlingRights: {
      whiteKingside: true,
      whiteQueenside: true,
      blackKingside: true,
      blackQueenside: true,
    },
    enPassantTarget: null,
    halfmoveClock: 0,
    fullmoveNumber: 1,
  };
}

/**
 * Create initial position state (full game start)
 */
export function createInitialPosition(): PositionState {
  return {
    boardState: createInitialBoardState(),
    metaState: createInitialMetaState(),
  };
}

/**
 * Create a deep copy of PositionState (immutability)
 */
export function clonePositionState(position: PositionState): PositionState {
  return {
    boardState: {
      board: [...position.boardState.board],
    },
    metaState: {
      activeColor: position.metaState.activeColor,
      castlingRights: { ...position.metaState.castlingRights },
      enPassantTarget: position.metaState.enPassantTarget,
      halfmoveClock: position.metaState.halfmoveClock,
      fullmoveNumber: position.metaState.fullmoveNumber,
    },
    hash: position.hash,
  };
}

/**
 * Toggle active color
 */
export function toggleActiveColor(color: Color): Color {
  return color === Color.White ? Color.Black : Color.White;
}
