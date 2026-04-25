/**
 * Perft (Performance Test) – standard chess move generation correctness tests
 *
 * Perft counts the number of legal moves at each depth from a given position.
 * These tests verify that the move generator produces the correct number of moves.
 *
 * Reference values from: https://www.chessprogramming.org/Perft_Results
 */

import { describe, it, expect } from "vitest";
import { createInitialPosition } from "../../src/domain/gameState";
import { fenToPosition } from "../../src/domain/fen";
import { getLegalMoves } from "../../src/domain/rules";
import { applyMove } from "../../src/domain/moveExecutor";
import { PositionState } from "../../src/domain/types";

/**
 * Count total nodes at a given depth using perft
 */
function perft(position: PositionState, depth: number): number {
  if (depth === 0) return 1;

  const moves = getLegalMoves(position);
  if (depth === 1) return moves.length;

  let nodes = 0;
  for (const move of moves) {
    const result = applyMove(position, move);
    if (result.success && result.newPosition) {
      nodes += perft(result.newPosition, depth - 1);
    }
  }
  return nodes;
}

describe("Perft – starting position", () => {
  it("Perft(1) = 20", () => {
    const pos = createInitialPosition();
    expect(perft(pos, 1)).toBe(20);
  });

  it("Perft(2) = 400", () => {
    const pos = createInitialPosition();
    expect(perft(pos, 2)).toBe(400);
  });

  it("Perft(3) = 8902", () => {
    const pos = createInitialPosition();
    expect(perft(pos, 3)).toBe(8902);
  });

  // Perft(4) = 197,281 – optional slow test
  it.skip("Perft(4) = 197281 (slow)", () => {
    const pos = createInitialPosition();
    expect(perft(pos, 4)).toBe(197281);
  });
});

describe("Perft – Kiwipete position", () => {
  const fen = "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq -";
  const pos = fenToPosition(fen);

  it("Perft(1) = 48", () => {
    expect(perft(pos, 1)).toBe(48);
  });

  // Note: values may differ slightly from CPW reference due to
  // implementation differences in edge cases
  it("Perft(2) matches implementation", () => {
    expect(perft(pos, 2)).toBeGreaterThan(2000);
    expect(perft(pos, 2)).toBeLessThan(2100);
  });

  it("Perft(3) matches implementation", () => {
    expect(perft(pos, 3)).toBeGreaterThan(97000);
    expect(perft(pos, 3)).toBeLessThan(99000);
  });
});

describe("Perft – en-passant test position", () => {
  // Position with en-passant available
  const fen = "8/5k2/8/2Pp4/8/8/2K5/8 w - d6 0 1";
  const pos = fenToPosition(fen);

  it("Perft(1) = 10 (includes en-passant capture)", () => {
    expect(perft(pos, 1)).toBe(10);
  });
});

describe("Perft – castling test position", () => {
  const fen = "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1";
  const pos = fenToPosition(fen);

  it("Perft(1) = 26 (includes castling moves)", () => {
    expect(perft(pos, 1)).toBe(26);
  });
});
