<template>
  <section
    id="suggestionboard"
    class="bg-cloud px-6 rounded-xl py-12 shadow-md"
  >
    <h2 class="font-mono text-night-300 font-bold text-2xl mb-4">
      Sanitary suggestions
    </h2>
    <Divider class="mb-8"/>
    <div class="main-content">
      <div class="graph"></div>
      <div class="stats flex flex-wrap">
        <div v-for="(suggestion, index) in suggestions" :key="index"  v-show="suggestion.status" class="row w-full">
          <a href="" class="row-text py-4 flex w-full">
            <p class="font-mono text-night-300">{{ suggestion.suggestion }}</p>
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
      totalComponents: 1440,
      deadComponents: 999,
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
        Math.round((this.deadComponents / this.totalComponents) * 10000) / 100
      );
    },
  },
  components: {
    Divider,
  },
};
</script>