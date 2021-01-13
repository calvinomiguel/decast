<template>
  <div
    :count="count"
    :origin="origin"
    :name="name"
    :originalmasterid="originalMasterId"
    :symbolIds="symbolIds"
    :originalfilename="originalFileName"
    :currentfilename="currentFileName"
    class="list-card flex items-center bg-cloud px-4 py-3 rounded hover:shadow-xl shadow transition-shadow ease-in-out duration-300 justify-between"
  >
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
export default {
  name: "ListCard",
  props: {
    origin: {
      type: String,
      default: "Root file name",
    },
    currentFileName: {
      type: String,
    },
    originalFileName: {
      type: String,
    },
    originalMasterId: {
      type: String,
    },
    symbolIds: {
      type: String,
    },
    name: {
      type: String,
      default: "Component name",
    },
    count: {
      type: Number,
      default: 0,
    },
  },
};
</script>
<style scoped>
</style>