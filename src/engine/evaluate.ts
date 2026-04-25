/**
 * Simple chess engine - Minimax with Alpha-Beta pruning
 */

import { PositionState, Color, Move } from "../domain/types";
import { generateAllMoves } from "../domain/moveGenerator";
import { applyMove } from "../domain/moveExecutor";
import { isInCheck, getLegalMoves } from "../domain/rules";
import { indexToCoord } from "../domain/board";

const PIECE_VALUES = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 0,
};

const POSITION_BONUSES = {
  pawn: [
    0, 0, 0, 0, 0, 0, 0, 0, 2, 4, 6, 8, 8, 6, 4, 2, 1, 2, 3, 5, 5, 3, 2, 1, 0,
    1, 2, 3, 3, 2, 1, 0, 0, 0, 1, 2, 2, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  knight: [
    0, 1, 2, 2, 2, 2, 1, 0, 1, 2, 3, 3, 3, 3, 2, 1, 2, 3, 4, 4, 4, 4, 3, 2, 2,
    3, 4, 4, 4, 4, 3, 2, 2, 3, 4, 4, 4, 4, 3, 2, 1, 2, 3, 3, 3, 3, 2, 1, 0, 1,
    2, 2, 2, 2, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0,
  ],
};

/**
 * Evaluate position from white's perspective
 */
export function evaluatePosition(position: PositionState): number {
  const { board } = position.boardState;
  let score = 0;

  for (let square = 0; square < 64; square++) {
    const piece = board[square];
    if (!piece) continue;

    const value = PIECE_VALUES[piece.type as keyof typeof PIECE_VALUES] || 0;
    const posBonus =
      (POSITION_BONUSES[piece.type as keyof typeof POSITION_BONUSES]?.[
        square
      ] || 0) * 0.1;

    const baseScore =
      (value + posBonus) * (piece.color === Color.White ? 1 : -1);
    score += baseScore;
  }

  // Bonus for being in check (encourages engine to give checks)
  if (isInCheck(position, Color.Black)) score += 0.5;
  if (isInCheck(position, Color.White)) score -= 0.5;

  return score;
}

/**
 * Minimax search with alpha-beta pruning
 */
export function findBestMove(
  position: PositionState,
  depth: number,
): Move | null {
  const legalMoves = getLegalMoves(position);
  if (legalMoves.length === 0) return null;

  let bestMove: Move | null = null;
  let bestScore = -Infinity;

  for (const move of legalMoves) {
    const result = applyMove(position, move);
    if (!result.success || !result.newPosition) continue;

    const score = -minimax(result.newPosition, depth - 1, -Infinity, Infinity);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

/**
 * Minimax with alpha-beta pruning
 */
function minimax(
  position: PositionState,
  depth: number,
  alpha: number,
  beta: number,
): number {
  if (depth === 0) {
    return evaluatePosition(position);
  }

  const legalMoves = getLegalMoves(position);
  if (legalMoves.length === 0) {
    const inCheck = isInCheck(position, position.metaState.activeColor);
    return inCheck ? -9999 : 0;
  }

  let maxScore = -Infinity;

  for (const move of legalMoves) {
    const result = applyMove(position, move);
    if (!result.success || !result.newPosition) continue;

    const score = -minimax(result.newPosition, depth - 1, -beta, -alpha);
    maxScore = Math.max(maxScore, score);
    alpha = Math.max(alpha, score);

    if (beta <= alpha) break;
  }

  return maxScore;
}
