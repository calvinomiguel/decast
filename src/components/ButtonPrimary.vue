<template>
  <button class="bg-ciel-200 w-full hover:bg-ciel-100 font-mono transition-all active:outline-white focus:outline-none duration-300 ease-in-out font-bold rounded-sm px-8 h-12 uppercase text-base text-cloud" id="button-primary">{{ text }}</button>
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