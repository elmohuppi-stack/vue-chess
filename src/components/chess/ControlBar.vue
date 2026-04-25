<template>
  <div class="bg-white rounded-lg shadow p-4 space-y-3">
    <!-- Player Selection -->
    <div>
      <p class="text-sm font-semibold text-gray-700 mb-2">Play As</p>
      <div class="flex gap-2">
        <button
          @click="gameStore.setPlayerColor(Color.White)"
          :class="[
            'flex-1 py-2 px-3 rounded font-semibold transition',
            gameStore.playerColor === Color.White
              ? 'bg-gray-800 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300',
          ]"
        >
          ⚪ White
        </button>
        <button
          @click="gameStore.setPlayerColor(Color.Black)"
          :class="[
            'flex-1 py-2 px-3 rounded font-semibold transition',
            gameStore.playerColor === Color.Black
              ? 'bg-gray-800 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300',
          ]"
        >
          ⚫ Black
        </button>
      </div>
    </div>

    <!-- Difficulty -->
    <div>
      <p class="text-sm font-semibold text-gray-700 mb-2">Difficulty</p>
      <select
        v-model.number="gameStore.engineDepth"
        class="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 font-semibold"
      >
        <option value="1">Easy (1)</option>
        <option value="2">Normal (2)</option>
        <option value="3">Hard (3)</option>
        <option value="4">Very Hard (4)</option>
      </select>
    </div>

    <!-- New Game Button -->
    <button
      @click="gameStore.resetGame"
      class="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded transition"
    >
      🔄 New Game
    </button>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from "@/stores/gameStore";
import { Color } from "@/domain/types";

const gameStore = useGameStore();
</script>
