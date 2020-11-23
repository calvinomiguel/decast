<template>
  <section id="deadboard" class="bg-cloud px-6 rounded-xl py-12 shadow-md">
    <h2 class="font-mono text-night-300 font-bold text-2xl mb-4">
      Dead Components
    </h2>
    <Divider />
    <div class="main-content">
      <div class="graph"></div>
      <div class="stats flex flex-wrap mb-6 mt-8">
        <div class="row w-full flex justify-between mb-4">
          <div class="row-text">
            <p class="font-mono text-night-300">Total Components</p>
            <p class="font-bold text-night-300 mt-2 font-mono">
              {{ totalComponents }}
            </p>
          </div>
          <div class="tag bg-night-300"></div>
        </div>
        <Divider />
        <div class="row w-full flex justify-between my-4">
          <div class="row-text">
            <p class="font-mono text-night-300">Total Components</p>
            <p class="font-bold font-mono text-night-300 mt-2">{{ deadComponents }}</p>
          </div>
          <div class="tag bg-lila-100"></div>
        </div>
        <Divider />
        <div class="ratio w-full mt-4">
          <h3 class="font-mono text-xl text-right text-night-300">
            Dead components ratio
          </h3>
          <p class="font-mono text-night-300 text-right font-bold">
            {{
              deadComponentsRatio
            }}%
          </p>
        </div>
      </div>
    </div>
    <ButtonPrimary text="See dead components" />
  </section>
</template>
<script>
import Divider from "@/components/Divider";
import ButtonPrimary from "@/components/ButtonPrimary";
export default {
  name: "DeadBoard",
  data() {
    return {
      totalComponents: 1440,
      deadComponents: 999,
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
    ButtonPrimary,
  },
};
</script>
<style scoped>
.tag {
  height: 12px;
  width: 12px;
  border-radius: 100%;
}
</style>