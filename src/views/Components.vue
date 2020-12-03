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
        <ListCard />
      </div>
    </aside>
    <main class="component-view bg-cloud">
      <div class="main-wrapper px-5 pt-6">
        <h1 class="font-mono font-bold text-4xl mb-3">{{ componentName }}</h1>
        <ButtonMenu class="mr-2" text="Component" />
        <ButtonMenu class="mr-2" text="Stats" />
        <ButtonMenu text="Usage context" />
        <Divider class="mt-5" />
        <div class="content-view">
          <div class="component-view"></div>
          <div class="stats-view">
            <h2 class="font-mono font-bold text-2xl">{{ viewTitle }}</h2>
          </div>
          <div class="context-view">
            <h2>{{ viewTitle }}</h2>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
<script>
import Search from "@/components/Search";
import ButtonOrganizer from "@/components/ButtonOrganizer";
import Checkbox from "@/components/Checkbox";
import ListCard from "@/components/ListCard";
import ButtonMenu from "@/components/ButtonMenu";
import Divider from "@/components/Divider";
export default {
  name: "Components",
  props: {
    componentName: {
      type: String,
      default: "btn-primary",
    },
    viewTitle: {
      type: String,
      default: "Component",
    },
  },
  components: {
    Search,
    ButtonOrganizer,
    Checkbox,
    ListCard,
    ButtonMenu,
    Divider,
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

.btn-organizer {
  max-width: calc(50% - 0.5rem);
}
</style>