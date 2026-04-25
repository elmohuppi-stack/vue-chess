<template>
  <div class="bg-white rounded-lg shadow p-4 space-y-3">
    <!-- Game Status -->
    <div class="text-center">
      <p class="text-sm text-gray-600">Status</p>
      <p class="text-lg font-bold text-amber-900">{{ statusText }}</p>
    </div>

    <!-- Active Player -->
    <div class="text-center">
      <p class="text-sm text-gray-600">Active Player</p>
      <p
        class="text-lg font-semibold"
        :class="isWhiteTurn ? 'text-gray-800' : 'text-gray-400'"
      >
        {{ isWhiteTurn ? "⚪ White" : "⚫ Black" }}
      </p>
    </div>

    <!-- Move Counter -->
    <div class="text-center">
      <p class="text-sm text-gray-600">Move</p>
      <p class="text-lg font-semibold text-amber-700">{{ moveNumber }}</p>
    </div>

    <!-- Check Indicator -->
    <div
      v-if="gameStore.isCheck"
      class="bg-red-100 border-l-4 border-red-500 p-3 text-red-800 rounded"
    >
      <p class="font-semibold">♔ Check!</p>
    </div>

    <!-- Computer Thinking -->
    <div
      v-if="gameStore.isComputerThinking"
      class="bg-blue-100 border-l-4 border-blue-500 p-3 text-blue-800 rounded"
    >
      <p class="font-semibold">🤖 Computer thinking...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useGameStore } from "@/stores/gameStore";
import { Color, GameStatus } from "@/domain/types";

const gameStore = useGameStore();

const isWhiteTurn = computed(
  () => gameStore.currentPosition.metaState.activeColor === Color.White,
);

const moveNumber = computed(() => {
  return gameStore.currentPosition.metaState.fullmoveNumber;
});

const statusText = computed(() => {
  switch (gameStore.gameStatus) {
    case GameStatus.Active:
      return "Playing";
    case GameStatus.Check:
      return "Check";
    case GameStatus.Checkmate:
      return "Checkmate!";
    case GameStatus.Stalemate:
      return "Stalemate";
    case GameStatus.Draw:
      return "Draw";
    default:
      return "Unknown";
  }
});
</script>
