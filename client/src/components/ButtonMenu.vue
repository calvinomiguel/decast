<template>
  <button
    class="text-xs bg-smokey text-night-100 uppercase font-mono font-bold rounded-xl py-1 px-2 hover:bg-lila-200 hover:text-cloud transition-all duration-300 ease-in-out"
  >
    {{ text }}
  </button>
</template>
<script>
export default {
  name: "ButtonMenu",
  props: {
    text: {
      type: String,
      default: "Button text",
    },
  },
};
</script>