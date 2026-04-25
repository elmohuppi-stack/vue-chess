<template>
  <span
    class="piece select-none text-6xl leading-none"
    :class="piece.color === 'black' ? 'piece-black' : 'piece-white'"
    >{{ pieceSymbol }}</span
  >
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Piece, Color } from "@/domain/types";

const props = defineProps<{
  piece: Piece;
}>();

// Chess symbols with best visual representation per piece type.
// Officers (rook, knight, bishop, queen, king) use filled symbols (♜♞♝♛♚)
// for bold appearance. Pawn uses the standard outlined symbol (♙) which
// renders more cleanly on most systems.
const pieceSymbols = {
  pawn: "♙",
  rook: "♜",
  knight: "♞",
  bishop: "♝",
  queen: "♛",
  king: "♚",
};

const pieceSymbol = computed(() => {
  return pieceSymbols[props.piece.type];
});
</script>
