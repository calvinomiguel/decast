<template>
  <router-link class="font-mono text-night-300 hover:underline" :to="link">
    {{ linkText }}
  </router-link>
</template>

<script>
export default {
  name: "NavLink",
  props: {
    link: {
      type: String,
    },
    linkText: {
      type: String,
      default: "Link",
    },
  },
};
</script>