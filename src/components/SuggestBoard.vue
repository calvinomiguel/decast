<template>
  <section
    id="suggestionboard"
    class="bg-cloud px-6 rounded-xl py-12 shadow-md"
  >
    <h2 class="font-mono text-night-300 font-bold text-2xl mb-4">
      Sanitary suggestions
    </h2>
    <Divider class="mb-4" />
    <div class="main-content">
      <div class="stats flex flex-wrap">
        <div
          v-for="(suggestion, index) in suggestions"
          :key="index"
          v-show="suggestion.status"
          class="row w-full"
        >
          <a href="" class="row-text py-4 flex items-center justify-between w-full">
            <p class="font-mono text-night-300">{{ suggestion.suggestion }}</p>
            <font-awesome-icon
              class="text-night-300"
              :icon="['fas', 'chevron-right']"
            />
          </a>
          <Divider />
        </div>
      </div>
    </div>
  </section>
</template>
<script>
import Divider from "@/components/Divider";
export default {
  name: "DeadBoard",
  data() {
    return {
      suggestions: [
        {
          suggestion: "Remove dead components",
          status: true,
        },
        {
          suggestion: "Remove less used components",
          status: true,
        },
        {
          suggestion: "Remove duplicate components",
          status: true,
        },
        {
          suggestion: "Split sketch file",
          status: true,
        },
        {
          suggestion: "Reduce number of layers",
          status: true,
        },
      ],
    };
  },
  computed: {
    deadComponentsRatio: function () {
      return (
        Math.round((this.deadComponents / this.allComponents) * 10000) / 100
      );
    },
  },
  components: {
    Divider,
  },
};
</script>