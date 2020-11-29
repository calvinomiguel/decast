<template>
  <label class="label-container flex align-center font-mono">
    <div class="checkbox-wrapper">
      <input class="checkbox-input" type="checkbox" :checked="checkedValue" />
      <span
        class="rounded flex align-center items-center justify-center checkmark checkboxStyle"
      ></span>
    </div>
    <span
      v-show="label == 'Label' ? null : label"
      class="items-center flex ml-2 label"
    >
      {{ label }}
    </span>
  </label>
</template>
<script>
export default {
  name: "CheckBox",
  props: {
    label: {
      type: String,
      default: "Label",
    },
    checkedValue: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
<style scoped>
/* The label-container */
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