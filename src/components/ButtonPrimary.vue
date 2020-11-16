<template>
  <button
    class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base leading-6 font-medium rounded text-white bg-ciel-200 hover:bg-ciel-100 focus:outline-none transition duration-150 ease-in-out md:py-4 md:text-lg md:px-10"
  >
    {{ btnText }}
  </button>
</template>
<script>
export default {
  name: "ButtonPrimary",
  props: {
    btnText: {
      type: String,
      required: true,
      default: "Button",
    },
    bgColor: String,
  },
};
</script>