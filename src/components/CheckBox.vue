<template>
  <label class="container flex align-center font-mono mr-8">
    <input type="checkbox" />
    <span
      :class="[
        'rounded',
        'flex',
        'align-center',
        'items-center',
        'justify-center',
        'checkmark',
        checkboxStyle,
      ]"
    ></span>
  </label>
</template>
<script>
export default {
  name: "CheckBox",
  props: {
    fontFamily: {
      type: String,
      default: "font-mono",
    },
    checkboxStyle: {
      type: String,
      default: "head-checkbox",
    },
  },
  data() {
    return {
      headLabel: "head-label",
      bodyLabel: "body-label",
      headCheckbox: "head-checkbox",
      bodyCheckbox: "head-checkbox",
    };
  },
};
</script>
<style scoped>
/* The container */
.container {
  position: relative;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  max-width: 28px;
}

/* Hide the browser's default checkbox */
.container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

/* Create a custom checkbox */
.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 28px;
  width: 28px;
}

.body-checkbox {
  border: 2px solid theme("colors.night.100");
}

.head-checkbox {
  border: 2px solid theme("colors.cloud");
}
/* On mouse-over, add a grey background color */
.container:hover input ~ .checkmark {
  background-color: theme("colors.night.300");
  border-color: theme("colors.lila.100");
}

/* When the checkbox is checked, add a blue background */
.container input:checked ~ .checkmark {
  background-color: theme("colors.lila.100");
  border-color: theme("colors.lila.100");
}

/* Create the checkmark/indicator (hidden when not checked) */
.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

/* Show the checkmark when checked */
.container input:checked ~ .checkmark:after {
  display: block;
}

/* Style the checkmark/indicator */
.container .checkmark:after {
  content: "✓";
  color: white;
  font-size: 20px;
}
</style>