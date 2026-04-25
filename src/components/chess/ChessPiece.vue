<template>
  <span class="piece select-none">{{ pieceSymbol }}</span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Piece, Color } from "@/domain/types";

const props = defineProps<{
  piece: Piece;
}>();

const pieceSymbols = {
  pawn: { white: "♙", black: "♟" },
  rook: { white: "♖", black: "♜" },
  knight: { white: "♘", black: "♞" },
  bishop: { white: "♗", black: "♝" },
  queen: { white: "♕", black: "♛" },
  king: { white: "♔", black: "♚" },
};

const pieceSymbol = computed(() => {
  return pieceSymbols[props.piece.type][props.piece.color];
});
</script>
