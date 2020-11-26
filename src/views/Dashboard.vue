<template>
  <main>
    <div class="main-wrapper">
      <section class="flex justify-between mt-12">
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
section > div {
  max-width: calc(50% - 1rem);
}

@media all and (max-width: 1172px) {
  section {
    flex-wrap: wrap;
  }

  section > div {
    max-width: 100%;
    width: 100%;
  }

  #suggestionboard {
    margin-top: 1.5rem;
  }
}
</style>