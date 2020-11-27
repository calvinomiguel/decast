<template>
  <div class="main-container flex">
    <aside class="bg-smokey">
      <Search />
    </aside>
    <main class="component-view bg-cloud"></main>
  </div>
</template>
<script>
import Search from "@/components/Search";

export default {
  name: "Components",
  components: {
    Search,
  },
};
</script>
<style scoped>
aside {
  max-width: 440px;
  width: 100%;
  display: block;
  max-height: 100vh;
  height: 100vh;
  padding: 1.5rem;
}

.component-view {
  height: 100vh;
  max-height: 100vh;
  width: 100%;
  max-width: calc(100% - 440px);
}
</style>