/**
 * Board coordinate utilities
 */

import type { Square } from "./types";

export const BOARD_SIZE = 8;
export const TOTAL_SQUARES = 64;

/**
 * Convert board index (0-63) to [row, col]
 * 0 = a1 (row 0, col 0), 63 = h8 (row 7, col 7)
 */
export function indexToCoord(index: Square): [number, number] {
  const row = Math.floor(index / BOARD_SIZE);
  const col = index % BOARD_SIZE;
  return [row, col];
}

/**
 * Convert [row, col] to board index (0-63)
 */
export function coordToIndex(row: number, col: number): Square {
  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
    throw new Error(`Invalid coordinates: [${row}, ${col}]`);
  }
  return (row * BOARD_SIZE + col) as Square;
}

/**
 * Check if index is valid (0-63)
 */
export function isValidIndex(index: number): index is Square {
  return index >= 0 && index < TOTAL_SQUARES;
}

/**
 * Convert index to algebraic notation (e.g., 0 -> 'a1', 63 -> 'h8')
 */
export function indexToAlgebraic(index: Square): string {
  const [row, col] = indexToCoord(index);
  const file = String.fromCharCode(97 + col); // 'a' to 'h'
  const rank = String(row + 1); // '1' to '8'
  return file + rank;
}

/**
 * Convert algebraic notation to index
 */
export function algebraicToIndex(notation: string): Square {
  if (notation.length !== 2)
    throw new Error(`Invalid algebraic notation: ${notation}`);
  const col = notation.charCodeAt(0) - 97; // 'a' to 'h'
  const row = parseInt(notation[1]) - 1; // '1' to '8'
  return coordToIndex(row, col);
}
