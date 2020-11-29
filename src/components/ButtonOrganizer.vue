<template>
  <button
    class="btn-organizer hover:bg-lila-200 active:outline-white focus:outline-none duration-300 ease-in-out  bg-lila-100 text-cloud uppercase font-mono font-bold text-xs flex items-center justify-center w-full py-1 rounded"
  >
    <div class="btn-wrapper flex items-center">
      <img :src="require(`@/assets/${fileName}`)" :alt="alt" />
      {{ btnText }}
    </div>
  </button>
</template>
<script>
export default {
  name: "ButtonOrganizer",
  props: {
    fileName: {
      type: String,
      default: "filter-icon.png",
    },
    btnText: {
      type: String,
      default: "Button",
    },

    alt: {
      type: String,
      default: "Icon",
    },
  },
};
</script>