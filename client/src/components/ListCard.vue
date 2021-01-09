<template>
  <div
    class="list-card flex items-center bg-cloud px-4 py-3 rounded hover:shadow-lg transition-shadow ease-in-out duration-300 justify-between border border-night-100"
  >
    <label class="label-container flex align-center mr-4 font-mono">
      <div class="checkbox-wrapper">
        <input class="checkbox-input" type="checkbox" />
        <span
          class="rounded flex align-center items-center justify-center checkmark checkboxStyle"
        ></span>
      </div>
    </label>
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
.label-container {
  position: relative;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Hide the browser's default checkbox */
.label-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkbox-wrapper {
  position: relative;
  height: 28px;
  width: 28px;
}

/* Create a custom checkbox */
.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 28px;
  width: 28px;
}

.checkmark {
  border: 1px solid theme("colors.night.100");
}

/* Create the checkmark/indicator (hidden when not checked) */
.checkmark:after {
  content: "";
  display: none;
}

/* Show the checkmark when checked */
.label-container input:checked ~ .checkmark:after {
  display: block;
}

/* Style the checkmark/indicator */
.label-container .checkmark:after {
  content: "✓";
  font-weight: bold;
  font-family: theme("fontFamily.mono");
  color: theme("colors.lila.200");
  font-size: 20px;
}
</style>