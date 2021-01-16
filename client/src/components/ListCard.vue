<template>
  <div
    :count="count"
    :origin="origin"
    :name="name"
    :originalmasterid="originalMasterId"
    :symbolids="symbolIds"
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
    <button class="delete-btn" @click.stop="$emit('delete', $event)">
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
      type: Array,
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
.delete-btn {
  border-radius: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 360ms ease-in-out;
}

.delete-btn:hover {
  background-color: theme("colors.smokey");
}

.delete-btn img {
  padding: 1rem;
}

.delete-btn:active,
.delete-btn:focus {
  outline: 0;
  border: none;
}
</style>