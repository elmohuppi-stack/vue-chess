/**
 * Pinia game store - game state orchestration
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  createInitialPosition,
  PositionState,
  GameContext,
  GameStatus,
  Move,
  Color,
  HistoricalMove,
} from "@/domain/types";
import { applyMove } from "@/domain/moveExecutor";
import { getLegalMoves, getGameStatus, isInCheck } from "@/domain/rules";
import { findBestMove } from "@/engine/evaluate";

export const useGameStore = defineStore("game", () => {
  // State
  const currentPosition = ref<PositionState>(createInitialPosition());
  const moveHistory = ref<HistoricalMove[]>([]);
  const selectedSquare = ref<number | null>(null);
  const highlightedSquares = ref<number[]>([]);
  const gameStatus = ref<GameStatus>(GameStatus.Active);
  const isComputerThinking = ref(false);
  const playerColor = ref<Color>(Color.White);
  const engineDepth = ref(2);

  // Computed
  const legalMoves = computed(() => getLegalMoves(currentPosition.value));

  const isCheck = computed(() =>
    isInCheck(
      currentPosition.value,
      currentPosition.value.metaState.activeColor,
    ),
  );

  const lastMove = computed(() => {
    const last = moveHistory.value[moveHistory.value.length - 1];
    return last ? [last.move.from, last.move.to] : null;
  });

  const canPlayerMove = computed(() => {
    return (
      currentPosition.value.metaState.activeColor === playerColor.value &&
      !isComputerThinking.value
    );
  });

  // Actions
  function selectSquare(square: number): void {
    if (!canPlayerMove.value) return;

    if (selectedSquare.value === square) {
      selectedSquare.value = null;
      highlightedSquares.value = [];
      return;
    }

    const piece = currentPosition.value.boardState.board[square];

    if (piece && piece.color === playerColor.value) {
      selectedSquare.value = square;
      const moves = legalMoves.value.filter((m) => m.from === square);
      highlightedSquares.value = moves.map((m) => m.to);
    } else if (selectedSquare.value !== null) {
      attemptMove(selectedSquare.value, square);
    }
  }

  function attemptMove(from: number, to: number, promotion?: string): void {
    const move = legalMoves.value.find(
      (m) =>
        m.from === from &&
        m.to === to &&
        (!promotion || m.promotion === promotion),
    );

    if (!move) return;

    executeMove(move);
    selectedSquare.value = null;
    highlightedSquares.value = [];

    // Check game status
    updateGameStatus();

    // Computer's turn
    if (currentPosition.value.metaState.activeColor !== playerColor.value) {
      setTimeout(makeComputerMove, 500);
    }
  }

  function executeMove(move: Move): void {
    const result = applyMove(currentPosition.value, move);
    if (!result.success || !result.newPosition) return;

    const historicalMove: HistoricalMove = {
      move,
      positionBefore: currentPosition.value,
      positionAfter: result.newPosition,
      timestamp: Date.now(),
    };

    moveHistory.value.push(historicalMove);
    currentPosition.value = result.newPosition;
  }

  function makeComputerMove(): void {
    if (currentPosition.value.metaState.activeColor === playerColor.value)
      return;

    isComputerThinking.value = true;

    setTimeout(() => {
      const move = findBestMove(currentPosition.value, engineDepth.value);
      if (move) {
        executeMove(move);
        updateGameStatus();
      }

      isComputerThinking.value = false;

      // Check if game ended
      if (getGameStatus(currentPosition.value) !== GameStatus.Active) {
        updateGameStatus();
      }
    }, 300);
  }

  function updateGameStatus(): void {
    gameStatus.value = getGameStatus(currentPosition.value);
  }

  function resetGame(): void {
    currentPosition.value = createInitialPosition();
    moveHistory.value = [];
    selectedSquare.value = null;
    highlightedSquares.value = [];
    gameStatus.value = GameStatus.Active;
    isComputerThinking.value = false;
  }

  function setPlayerColor(color: Color): void {
    resetGame();
    playerColor.value = color;
  }

  function setEngineDepth(depth: number): void {
    engineDepth.value = Math.max(1, Math.min(depth, 5));
  }

  return {
    // State
    currentPosition,
    moveHistory,
    selectedSquare,
    highlightedSquares,
    gameStatus,
    isComputerThinking,
    playerColor,
    engineDepth,

    // Computed
    legalMoves,
    isCheck,
    lastMove,
    canPlayerMove,

    // Actions
    selectSquare,
    attemptMove,
    makeComputerMove,
    updateGameStatus,
    resetGame,
    setPlayerColor,
    setEngineDepth,
  };
});
