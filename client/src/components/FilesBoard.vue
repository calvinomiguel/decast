<template>
  <section
    id="filesboard"
    class="bg-cloud px-6 rounded-xl py-12 shadow-md"
  >
    <h2 class="font-mono text-night-300 font-bold text-2xl mb-4">
      Files
    </h2>
    <Divider class="mb-4" />
    <div class="main-content">
      <div class="graph" />
      <div class="stats flex flex-wrap">
        <div
          v-for="(file, index) in files"
          :key="index"
          class="row w-full"
        >
          <div class="row-text py-4 flex items-center justify-between w-full">
            <p class="font-mono text-night-300">
              {{ file.name }}
            </p>
            <p class="font-mono text-night-300">
              {{ file.size }} MB
            </p>
          </div>
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
      files: [
        {
          name: "Robot.sketch",
          size: 2.5,
        },
        {
          name: "Chatbot.sketch",
          size: 4,
        },
        {
          name: "Harbor.sketch",
          size: 2.5,
        },
        {
          name: "Website.sketch",
          size: 3.6,
        },
      ],
    };
  },
  components: {
    Divider,
  },
};
</script>