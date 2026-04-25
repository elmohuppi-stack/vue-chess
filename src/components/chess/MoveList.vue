<template>
  <div class="bg-white rounded-lg shadow p-4">
    <p class="text-sm font-semibold text-gray-700 mb-2">Move History</p>
    <div class="max-h-64 overflow-y-auto space-y-1">
      <div
        v-for="(move, idx) in gameStore.moveHistory"
        :key="idx"
        class="text-sm text-gray-700 p-2 hover:bg-amber-50 rounded"
      >
        <span class="font-semibold text-amber-700">{{ idx + 1 }}.</span>
        {{ formatMove(idx) }}
      </div>
      <div
        v-if="gameStore.moveHistory.length === 0"
        class="text-sm text-gray-400 italic"
      >
        No moves yet
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from "@/stores/gameStore";
import { indexToAlgebraic } from "@/domain/board";

const gameStore = useGameStore();

function formatMove(idx: number) {
  const historical = gameStore.moveHistory[idx];
  if (!historical) return "";

  const from = indexToAlgebraic(historical.move.from as any);
  const to = indexToAlgebraic(historical.move.to as any);

  return `${from} → ${to}`;
}
</script>
