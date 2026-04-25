<template>
  <div
    class="board-square"
    :class="[
      isLight ? 'light' : 'dark',
      isHighlighted && 'highlighted',
      isLastMove && 'lastmove',
    ]"
    @click="handleClick"
  >
    <ChessPiece v-if="piece" :piece="piece" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useGameStore } from "@/stores/gameStore";
import ChessPiece from "./ChessPiece.vue";

const props = defineProps<{
  square: number;
}>();

const gameStore = useGameStore();

const piece = computed(
  () => gameStore.currentPosition.boardState.board[props.square],
);

const isLight = computed(() => {
  const row = Math.floor(props.square / 8);
  const col = props.square % 8;
  return (row + col) % 2 === 0;
});

const isHighlighted = computed(() => {
  return gameStore.highlightedSquares.includes(props.square);
});

const isLastMove = computed(() => {
  return gameStore.lastMove && gameStore.lastMove.includes(props.square);
});

function handleClick() {
  gameStore.selectSquare(props.square);
}
</script>
