<template>
  <div id="app">
    <router-view />
  </div>
</template>
<script>
export default {
  name: "App",
  components: {
  },
};
</script>
<style>
#app {
  font-family: theme("fontFamily.mono");
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: theme("colors.smokey");
}
</style>
