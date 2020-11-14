<template>
  <div id="app"></div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      symbols: 100,
      instances: 100,
      artboards: 100,
    };
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
