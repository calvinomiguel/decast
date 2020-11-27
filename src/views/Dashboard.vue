<template>
  <main>
    <div class="main-wrapper">
      <section class="flex justify-between items-stretch mt-12">
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
#deadboard,
#suggestionboard {
  max-width: calc(50% - 1rem);
  width: 100%;
}

main {
  min-height: 100vh;
  padding: 0 24px 80px 24px;
}
@media all and (max-width: 1172px) {
  section {
    flex-wrap: wrap;
  }

  #deadboard,
  #suggestionboard {
    max-width: 100%;
  }

  #suggestionboard {
    margin-top: 1.5rem;
  }
}
</style>