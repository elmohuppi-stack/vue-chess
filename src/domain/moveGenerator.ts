/**
 * Move generation for all pieces
 * Generates pseudo-legal moves (doesn't check for own king check)
 */

import { Move, PositionState, Color, Piece, Square, BoardState } from "./types";
import { coordToIndex, indexToCoord, isValidIndex, BOARD_SIZE } from "./board";

/**
 * Generate all pseudo-legal moves for a position
 */
export function generateAllMoves(position: PositionState): Move[] {
  const moves: Move[] = [];
  const { board } = position.boardState;
  const { activeColor } = position.metaState;

  for (let square = 0; square < 64; square++) {
    const piece = board[square];
    if (!piece || piece.color !== activeColor) continue;

    const pieceMoves = generateMovesForSquare(square as Square, position);
    moves.push(...pieceMoves);
  }

  return moves;
}

/**
 * Generate pseudo-legal moves for a specific square
 */
export function generateMovesForSquare(
  square: Square,
  position: PositionState,
): Move[] {
  const { board } = position.boardState;
  const piece = board[square];

  if (!piece) return [];

  switch (piece.type) {
    case "pawn":
      return generatePawnMoves(square, position);
    case "rook":
      return generateSlidingMoves(square, position, [
        [0, 1],
        [1, 0],
        [0, -1],
        [-1, 0],
      ]);
    case "bishop":
      return generateSlidingMoves(square, position, [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ]);
    case "queen":
      return generateSlidingMoves(square, position, [
        [0, 1],
        [1, 0],
        [0, -1],
        [-1, 0],
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ]);
    case "knight":
      return generateKnightMoves(square, position);
    case "king":
      return generateKingMoves(square, position);
    default:
      return [];
  }
}

/**
 * Generate sliding moves (rook, bishop, queen)
 */
function generateSlidingMoves(
  square: Square,
  position: PositionState,
  directions: [number, number][],
): Move[] {
  const moves: Move[] = [];
  const [row, col] = indexToCoord(square);
  const { board } = position.boardState;
  const piece = board[square]!;

  for (const [dRow, dCol] of directions) {
    let r = row + dRow;
    let c = col + dCol;

    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
      const targetIndex = coordToIndex(r, c) as Square;
      const target = board[targetIndex];

      if (target === null) {
        moves.push({
          from: square,
          to: targetIndex,
          isCapture: false,
          isCastling: false,
          isEnPassant: false,
        });
      } else if (target.color !== piece.color) {
        moves.push({
          from: square,
          to: targetIndex,
          isCapture: true,
          isCastling: false,
          isEnPassant: false,
        });
        break;
      } else {
        break;
      }

      r += dRow;
      c += dCol;
    }
  }

  return moves;
}

/**
 * Generate knight moves
 */
function generateKnightMoves(square: Square, position: PositionState): Move[] {
  const moves: Move[] = [];
  const [row, col] = indexToCoord(square);
  const { board } = position.boardState;
  const piece = board[square]!;

  const knightMoves = [
    [2, 1],
    [2, -1],
    [-2, 1],
    [-2, -1],
    [1, 2],
    [1, -2],
    [-1, 2],
    [-1, -2],
  ];

  for (const [dRow, dCol] of knightMoves) {
    const r = row + dRow;
    const c = col + dCol;

    if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) continue;

    const targetIndex = coordToIndex(r, c) as Square;
    const target = board[targetIndex];

    if (target === null || target.color !== piece.color) {
      moves.push({
        from: square,
        to: targetIndex,
        isCapture: target !== null,
        isCastling: false,
        isEnPassant: false,
      });
    }
  }

  return moves;
}

/**
 * Generate pawn moves
 */
function generatePawnMoves(square: Square, position: PositionState): Move[] {
  const moves: Move[] = [];
  const [row, col] = indexToCoord(square);
  const { board } = position.boardState;
  const piece = board[square]!;
  const { activeColor, enPassantTarget, castlingRights } = position.metaState;

  const direction = piece.color === Color.White ? 1 : -1;
  const startRow = piece.color === Color.White ? 1 : 6;
  const promotionRow = piece.color === Color.White ? 7 : 0;

  // Single step forward
  const forwardRow = row + direction;
  if (forwardRow >= 0 && forwardRow < BOARD_SIZE) {
    const forwardIndex = coordToIndex(forwardRow, col) as Square;
    if (board[forwardIndex] === null) {
      if (forwardRow === promotionRow) {
        moves.push({
          from: square,
          to: forwardIndex,
          promotion: "queen",
          isCapture: false,
          isCastling: false,
          isEnPassant: false,
        });
        moves.push({
          from: square,
          to: forwardIndex,
          promotion: "rook",
          isCapture: false,
          isCastling: false,
          isEnPassant: false,
        });
        moves.push({
          from: square,
          to: forwardIndex,
          promotion: "bishop",
          isCapture: false,
          isCastling: false,
          isEnPassant: false,
        });
        moves.push({
          from: square,
          to: forwardIndex,
          promotion: "knight",
          isCapture: false,
          isCastling: false,
          isEnPassant: false,
        });
      } else {
        moves.push({
          from: square,
          to: forwardIndex,
          isCapture: false,
          isCastling: false,
          isEnPassant: false,
        });

        // Double step from starting position
        if (row === startRow) {
          const doubleIndex = coordToIndex(row + 2 * direction, col) as Square;
          if (board[doubleIndex] === null) {
            moves.push({
              from: square,
              to: doubleIndex,
              isCapture: false,
              isCastling: false,
              isEnPassant: false,
              isDoubleStep: true,
            });
          }
        }
      }
    }
  }

  // Captures and en-passant
  for (const captureCol of [col - 1, col + 1]) {
    if (captureCol < 0 || captureCol >= BOARD_SIZE) continue;

    const captureRow = row + direction;
    if (captureRow < 0 || captureRow >= BOARD_SIZE) continue;

    const captureIndex = coordToIndex(captureRow, captureCol) as Square;
    const target = board[captureIndex];

    // Normal capture
    if (target && target.color !== piece.color) {
      if (captureRow === promotionRow) {
        moves.push({
          from: square,
          to: captureIndex,
          promotion: "queen",
          isCapture: true,
          isCastling: false,
          isEnPassant: false,
        });
        // ... add rook, bishop, knight promos
      } else {
        moves.push({
          from: square,
          to: captureIndex,
          isCapture: true,
          isCastling: false,
          isEnPassant: false,
        });
      }
    }

    // En-passant
    if (enPassantTarget === captureIndex) {
      moves.push({
        from: square,
        to: captureIndex,
        isCapture: true,
        isCastling: false,
        isEnPassant: true,
      });
    }
  }

  return moves;
}

/**
 * Generate king moves (including castling)
 */
function generateKingMoves(square: Square, position: PositionState): Move[] {
  const moves: Move[] = [];
  const [row, col] = indexToCoord(square);
  const { board } = position.boardState;
  const piece = board[square]!;
  const { castlingRights } = position.metaState;

  // Regular king moves
  for (let dRow = -1; dRow <= 1; dRow++) {
    for (let dCol = -1; dCol <= 1; dCol++) {
      if (dRow === 0 && dCol === 0) continue;

      const r = row + dRow;
      const c = col + dCol;

      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) continue;

      const targetIndex = coordToIndex(r, c) as Square;
      const target = board[targetIndex];

      if (target === null || target.color !== piece.color) {
        moves.push({
          from: square,
          to: targetIndex,
          isCapture: target !== null,
          isCastling: false,
          isEnPassant: false,
        });
      }
    }
  }

  // Castling
  if (piece.color === Color.White) {
    // Kingside castling
    if (
      castlingRights.whiteKingside &&
      board[5] === null &&
      board[6] === null
    ) {
      moves.push({
        from: square,
        to: 6 as Square,
        isCapture: false,
        isCastling: true,
        isEnPassant: false,
      });
    }
    // Queenside castling
    if (
      castlingRights.whiteQueenside &&
      board[1] === null &&
      board[2] === null &&
      board[3] === null
    ) {
      moves.push({
        from: square,
        to: 2 as Square,
        isCapture: false,
        isCastling: true,
        isEnPassant: false,
      });
    }
  } else {
    // Kingside castling
    if (
      castlingRights.blackKingside &&
      board[61] === null &&
      board[62] === null
    ) {
      moves.push({
        from: square,
        to: 62 as Square,
        isCapture: false,
        isCastling: true,
        isEnPassant: false,
      });
    }
    // Queenside castling
    if (
      castlingRights.blackQueenside &&
      board[57] === null &&
      board[58] === null &&
      board[59] === null
    ) {
      moves.push({
        from: square,
        to: 58 as Square,
        isCapture: false,
        isCastling: true,
        isEnPassant: false,
      });
    }
  }

  return moves;
}
