<template>
  <div class="main-container flex">
    <aside class="bg-smokey">
      <Search />
      <div class="organizer-wrapper flex justify-between mt-3">
        <ButtonOrganizer
          class=""
          alt="Sort icon"
          fileName="sort-icon.png"
          btn-text="Sort"
        />
        <ButtonOrganizer alt="Filter icon" btn-text="Filter" />
      </div>
      <Checkbox label="Select all" class="ml-4 mt-8" />
      <div class="components-list mt-4">
        <ListCard/>
      </div>
    </aside>
    <main class="component-view bg-cloud"></main>
  </div>
</template>
<script>
import Search from "@/components/Search";
import ButtonOrganizer from "@/components/ButtonOrganizer";
import Checkbox from "@/components/Checkbox";
import ListCard from "@/components/ListCard";

export default {
  name: "Components",
  components: {
    Search,
    ButtonOrganizer,
    Checkbox,
    ListCard,
  }
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

.btn-organizer {
  max-width: calc(50% - 0.5rem);
}
</style>