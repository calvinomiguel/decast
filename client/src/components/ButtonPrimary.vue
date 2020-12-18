<template>
  <button class="bg-lila-100 w-full hover:bg-lila-200 font-mono transition-all active:outline-white focus:outline-none duration-300 ease-in-out font-bold rounded-lg px-8 h-12 text-base text-cloud" id="button-primary">{{ text }}</button>
</template>

<script>
export default {
  name: "ButtonPrimary",
  props: {
    text: {
      type: String,
      required: true,
      default: "Button",
    },
  },
};
</script>