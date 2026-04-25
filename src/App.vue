<template>
  <div class="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-amber-900 mb-2">Vue Chess</h1>
        <p class="text-amber-700">Play against the computer</p>
      </div>

      <!-- Main Game Container -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Board -->
        <div class="lg:col-span-3">
          <ChessBoard />
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1 space-y-4">
          <GamePanel />
          <ControlBar />
          <MoveList />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChessBoard from "./components/chess/ChessBoard.vue";
import GamePanel from "./components/chess/GamePanel.vue";
import ControlBar from "./components/chess/ControlBar.vue";
import MoveList from "./components/chess/MoveList.vue";
</script>

<style scoped></style>
