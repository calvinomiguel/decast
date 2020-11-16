<template>
  <div id="app">
    <nav-bar></nav-bar>
  </div>
</template>
<script>
import NavBar from "@/components/NavBar";

export default {
  name: "App",
  components: {
    NavBar,
  },
};
</script>
<style>
#app {
  height: 100vh;
  width: 100vw;
}
</style>
