<template>
  <div id="suggestionboard" class="bg-cloud px-6 rounded-xl py-12 shadow-md">
    <h2 class="font-mono text-night-300 font-bold text-2xl mb-4">
      Potential areas for improvement
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
          <div class="row-text py-4 flex items-center justify-between w-full">
            <p class="font-mono text-night-300">{{ suggestion.suggestion }}</p>
          </div>
          <Divider />
        </div>
      </div>
      <div v-show="showEmptyState" class="empty-state px-3 w-8/12">
        <font-awesome-icon
          class="fai text-greyolett-200 text-4xl mb-2"
          :icon="['fas', 'check-circle']"
        />
        <h2 class="font-mono font-bold text-night-300 text-xl text-center mb-3">
          Things seem to be all right
        </h2>
        <p class="font-mono text-night-200 text-center">
          It seems that you are taking good care of your library. Nevertheless,
          don't miss the chance to take a closer look at it with decast.
        </p>
      </div>
    </div>
  </div>
</template>
<script>
import Divider from "@/components/Divider";
export default {
  name: "DeadBoard",
  data() {
    return {
     
    };
  },
  props: {
    suggestions: {
      type: Array,
    },
  },
  components: {
    Divider,
  },
  computed: {
    showEmptyState: function () {
      let statusFalse = 0;
      this.suggestions.forEach((suggestion) => {
        if (suggestion.status == false) {
          statusFalse += 1;
        }
      });
      
      return statusFalse == 3 ? true : false;
    },
  },
};
</script>
<style scoped>
.main-content {
  height: calc(100% - 4rem - 36px);
}
.fai {
  position: relative;
  left: 50%;
  transform: translate(-50%, 0);
}
.empty-state {
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>