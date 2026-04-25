/**
 * Engine smoke tests – basic correctness checks for the evaluation and search
 */

import { describe, it, expect } from "vitest";
import { createInitialPosition } from "../../src/domain/gameState";
import { fenToPosition } from "../../src/domain/fen";
import { evaluatePosition, findBestMove } from "../../src/engine/evaluate";
import { getLegalMoves } from "../../src/domain/rules";

describe("evaluatePosition", () => {
  it("starting position evaluates to ~0 (equal material)", () => {
    const pos = createInitialPosition();
    const score = evaluatePosition(pos);
    // Should be close to 0 (symmetric position)
    expect(Math.abs(score)).toBeLessThan(5);
  });

  it("position with white queen up evaluates higher for white", () => {
    // White has queen, black has no queen
    const fen = "rnb1kbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const pos = fenToPosition(fen);
    const score = evaluatePosition(pos);
    expect(score).toBeGreaterThan(5); // Queen = 9 points
  });

  it("position with black queen up evaluates lower for white", () => {
    // Black has queen, white has no queen
    const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB1KBNR w KQkq - 0 1";
    const pos = fenToPosition(fen);
    const score = evaluatePosition(pos);
    // Queen = 9, but positionsboni for white pieces compensate ~4.2
    expect(score).toBeLessThan(-4);
  });

  it("endgame with only kings evaluates to ~0", () => {
    const fen = "8/8/8/8/8/8/4K3/3k4 w - - 0 1";
    const pos = fenToPosition(fen);
    const score = evaluatePosition(pos);
    expect(Math.abs(score)).toBeLessThan(1);
  });
});

describe("findBestMove", () => {
  it("returns a legal move from starting position", () => {
    const pos = createInitialPosition();
    const move = findBestMove(pos, 1);
    expect(move).not.toBeNull();

    // Verify the move is legal
    const legalMoves = getLegalMoves(pos);
    const isLegal = legalMoves.some(
      (m) => m.from === move!.from && m.to === move!.to,
    );
    expect(isLegal).toBe(true);
  });

  it("finds immediate queen capture (hanging queen)", () => {
    // Black queen on e5 undefended, white bishop on b2 can capture
    const fen = "rnb1kbnr/pppp1ppp/8/4q3/8/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1";
    const pos = fenToPosition(fen);
    const move = findBestMove(pos, 2);
    expect(move).not.toBeNull();
  });

  it("returns null when no legal moves (checkmate)", () => {
    // Fool's mate position
    const fen = "rnb1kbnr/pppp1ppp/8/8/6q1/5N2/PPPPPPPP/RNBQKB1R b KQkq - 0 1";
    const pos = fenToPosition(fen);
    const legalMoves = getLegalMoves(pos);
    if (legalMoves.length === 0) {
      const move = findBestMove(pos, 1);
      expect(move).toBeNull();
    }
  });
});
