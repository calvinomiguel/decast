<template>
  <div id="app">
    <NavBar />
    <router-view />
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
  font-family: theme("fontFamily.mono");
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: theme("colors.lila.100");
}

main {
  min-height: 100vh;
  padding: 0 24px 80px 24px;
}

.main-wrapper {
  max-width: 1224px;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
}
</style>
