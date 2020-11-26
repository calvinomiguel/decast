<template>
  <main>
    <div class="main-wrapper">
      <section class="flex justify-between mt-8">
        <DeadBoard />
        <SuggestBoard />
      </section>
    </div>
  </main>
</template>
<script>
import DeadBoard from "@/components/DeadBoard";
import SuggestBoard from "@/components/SuggestBoard";
export default {
  name: "Dashboard",
  components: {
    DeadBoard,
    SuggestBoard,
  },
};
</script>
<style scoped>
</style>