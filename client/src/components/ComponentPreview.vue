<template>
  <img :src="imgPath" alt="Component preview" />
</template>
<script>
export default {
  name: "ComponentPreview",
  props: {
    imgPath: {
      type: String,
    },
  },
};
</script>