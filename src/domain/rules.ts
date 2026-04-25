/**
 * Chess rules - check, checkmate, stalemate, etc.
 */

import { PositionState, GameStatus, Color, Square } from "./types";
import { generateAllMoves, generateMovesForSquare } from "./moveGenerator";
import { applyMove } from "./moveExecutor";
import { indexToCoord, coordToIndex, BOARD_SIZE } from "./board";

/**
 * Check if a position is under attack by enemy
 */
export function isSquareAttacked(
  position: PositionState,
  square: Square,
  byColor: Color,
): boolean {
  const { board } = position.boardState;
  const piece = board[square];

  // Check pawn attacks
  const pawnDirection = byColor === Color.White ? -1 : 1;
  const attackRows = [
    square - pawnDirection * BOARD_SIZE - 1,
    square - pawnDirection * BOARD_SIZE + 1,
  ];
  for (const attackRow of attackRows) {
    if (attackRow >= 0 && attackRow < 64) {
      const target = board[attackRow];
      if (target?.type === "pawn" && target.color === byColor) {
        return true;
      }
    }
  }

  // Check knight attacks
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
  const [squareRow, squareCol] = indexToCoord(square);
  for (const [dRow, dCol] of knightMoves) {
    const r = squareRow + dRow;
    const c = squareCol + dCol;
    if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
      const attackIndex = coordToIndex(r, c) as Square;
      const attacker = board[attackIndex];
      if (attacker?.type === "knight" && attacker.color === byColor) {
        return true;
      }
    }
  }

  // Check sliding piece attacks (bishop, rook, queen)
  const slidingDirs = [
    [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ], // rook
    [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ], // bishop
  ];
  const slidingPieces = [
    ["rook", "queen"],
    ["bishop", "queen"],
  ];

  for (const dirs of slidingDirs) {
    for (const [dRow, dCol] of dirs) {
      let r = squareRow + dRow;
      let c = squareCol + dCol;

      while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
        const idx = coordToIndex(r, c) as Square;
        const blocker = board[idx];

        if (blocker) {
          if (blocker.color === byColor) {
            // Rook/Queen attacks
            if (
              dirs === slidingDirs[0] &&
              (blocker.type === "rook" || blocker.type === "queen")
            ) {
              return true;
            }
            // Bishop/Queen attacks
            if (
              dirs === slidingDirs[1] &&
              (blocker.type === "bishop" || blocker.type === "queen")
            ) {
              return true;
            }
          }
          break;
        }

        r += dRow;
        c += dCol;
      }
    }
  }

  // Check king attacks
  const [kingRow, kingCol] = indexToCoord(square);
  for (let dRow = -1; dRow <= 1; dRow++) {
    for (let dCol = -1; dCol <= 1; dCol++) {
      if (dRow === 0 && dCol === 0) continue;
      const r = kingRow + dRow;
      const c = kingCol + dCol;
      if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
        const idx = coordToIndex(r, c) as Square;
        const attacker = board[idx];
        if (attacker?.type === "king" && attacker.color === byColor) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Find king square
 */
function findKingSquare(position: PositionState, color: Color): Square | null {
  const { board } = position.boardState;
  for (let i = 0; i < 64; i++) {
    if (board[i]?.type === "king" && board[i]?.color === color) {
      return i as Square;
    }
  }
  return null;
}

/**
 * Check if king is in check
 */
export function isInCheck(position: PositionState, color: Color): boolean {
  const kingSquare = findKingSquare(position, color);
  if (!kingSquare) return false;

  const enemy = color === Color.White ? Color.Black : Color.White;
  return isSquareAttacked(position, kingSquare, enemy);
}

/**
 * Check if a move is legal (doesn't leave king in check)
 */
export function isMoveLegal(position: PositionState, move: any): boolean {
  const result = applyMove(position, move);
  if (!result.success || !result.newPosition) return false;

  const color = position.metaState.activeColor;
  return !isInCheck(result.newPosition, color);
}

/**
 * Get legal moves
 */
export function getLegalMoves(position: PositionState): any[] {
  const pseudoLegal = generateAllMoves(position);
  return pseudoLegal.filter((move) => isMoveLegal(position, move));
}

/**
 * Determine game status
 */
export function getGameStatus(position: PositionState): GameStatus {
  const color = position.metaState.activeColor;
  const inCheck = isInCheck(position, color);
  const legalMoves = getLegalMoves(position);

  if (legalMoves.length === 0) {
    return inCheck ? GameStatus.Checkmate : GameStatus.Stalemate;
  }

  if (inCheck) {
    return GameStatus.Check;
  }

  // Check for draw conditions (50-move rule, threefold, insufficient material)
  if (position.metaState.halfmoveClock >= 100) {
    return GameStatus.Draw;
  }

  if (!hasInsufficientMaterial(position)) {
    return GameStatus.Draw;
  }

  return GameStatus.Active;
}

/**
 * Check for insufficient material draw
 */
function hasInsufficientMaterial(position: PositionState): boolean {
  const { board } = position.boardState;
  const pieces = board.filter((p) => p !== null);

  // Only kings
  if (pieces.length === 2) return true;

  // King + knight or King + bishop
  if (pieces.length === 3) {
    const nonKings = pieces.filter((p) => p!.type !== "king");
    return nonKings.some((p) => p!.type === "knight" || p!.type === "bishop");
  }

  return false;
}
