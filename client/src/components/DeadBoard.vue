<template>
  <div id="deadboard" class="bg-cloud px-6 rounded-xl py-12 shadow-md">
    <h2 class="font-mono text-night-300 font-bold text-2xl mb-4">Components</h2>
    <Divider />
    <div class="main-content flex justify-between py-8">
      <pie-chart
        id="pie-chart"
        width="240px"
        height="240px"
        :data="[
          ['Dead components', deadComponents],
          ['Used components', usedComponents],
        ]"
        :colors="colors"
        :legend="false"
      ></pie-chart>
      <div class="stats w-6/12 flex flex-wrap mb-6 mt-8">
        <div class="row w-full flex justify-between mb-4">
          <div class="row-text">
            <p class="font-mono text-night-300">Used components</p>
            <p class="font-bold font-mono text-night-300 mt-2">
              {{ usedComponents }}
            </p>
          </div>
          <div class="tag bg-night-300"></div>
        </div>
        <Divider />
        <div class="row w-full flex justify-between my-4">
          <div class="row-text">
            <p class="font-mono text-night-300">Dead components</p>
            <p class="font-bold font-mono text-night-300 mt-2">
              {{ deadComponents }}
            </p>
          </div>
          <div class="tag bg-lila-100"></div>
        </div>
        <Divider />
        <div class="row w-full flex justify-between my-4">
          <div class="row-text">
            <p class="font-mono text-night-300">Total components</p>
            <p class="font-bold text-night-300 mt-2 font-mono">
              {{ totalComponents }}
            </p>
          </div>
        </div>
        <Divider />
        <div class="ratio w-full mt-4">
          <h3 class="font-mono text-xl text-right text-night-300">
            Dead components ratio
          </h3>
          <p class="font-mono text-night-300 text-xl text-right font-bold">
            {{ deadRatioNumber + "%" }}
          </p>
        </div>
      </div>
    </div>
    <ButtonPrimary v-on:click.native="goToComponents" text="Go to components" />
  </div>
</template>
<script>
import Divider from "@/components/Divider";
import ButtonPrimary from "@/components/ButtonPrimary";
export default {
  name: "DeadBoard",
  data() {
    return {
      colors: ["#856de7", "#23272a"],
    };
  },
  props: {
    deadRatioNumber: {
      type: Number,
    },
    deadComponents: {
      type: Number,
    },
    totalComponents: {
      type: Number,
    },
    usedComponents: {
      type: Number,
    },
  },
  methods: {
    goToComponents() {
      this.$router.push("/components");
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

#pie-chart {
  max-width: 50%;
}
</style>