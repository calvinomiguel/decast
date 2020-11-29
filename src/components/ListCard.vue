<template>
  <div
    class="list-card flex items-center bg-cloud px-4 py-3 rounded border hover:shadow-lg transition-all ease-in-out duration-300 justify-between border-night-100"
  >
    <Checkbox
      v-model="checkboxValue"
      class="mr-4"
      :checkedValue="checkboxValue"
    />
    <div class="card-text flex flex-wrap mr-auto">
      <span class="component-name w-full font-mono font-bold text-sm">
        {{ name }}
      </span>
      <span class="component-count w-full font-mono text-night-100 text-sm">
        {{ count }}
      </span>
    </div>
    <button class="delete-btn">
      <img src="../assets/delete-icon.svg" alt="Delete icon" />
    </button>
  </div>
</template>
<script>
import Checkbox from "@/components/Checkbox";
export default {
  name: "ListCard",
  data() {
    return {
      checkboxValue: true,
    };
  },
  props: {
    name: {
      type: String,
      default: "Component name",
    },
    count: {
      type: Number,
      default: 9630,
    },
  },
  watch: {
    checkboxValue: function () {
      console.log("Hi");
    },
  },
  components: {
    Checkbox,
  },
};
</script>
<style scoped>
</style>