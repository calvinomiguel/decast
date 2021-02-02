<template>
  <img
    class="component-preview"
    :src="imgPath"
    alt="Component preview"
  >
</template>
<script>
export default {
  name: "ComponentPreview",
  props: {
    imgPath: {
      type: String,
      default:""
    },
  },
};
</script>