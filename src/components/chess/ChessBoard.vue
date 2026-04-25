<template>
  <div class="bg-white rounded-lg shadow-xl p-4 overflow-auto">
    <div
      class="grid grid-cols-8 gap-0 border-4 border-gray-800 mx-auto"
      style="width: fit-content"
    >
      <ChessSquare v-for="square in 64" :key="square" :square="square - 1" />
    </div>
  </div>
</template>

<script setup lang="ts">
import ChessSquare from "./ChessSquare.vue";
</script>
