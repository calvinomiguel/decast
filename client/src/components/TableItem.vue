<template>
  <div id="table-item">
    <div
      @click="check"
      class="px-6 py-6 cursor-pointer flex table-head bg-cloud"
    >
      <CheckBox :checkbox-style="'body-checkbox'" />
      <div class="column-item">
        <span class="column-name font-mono text-lg text-night-300">
          {{ componentName }}
        </span>
      </div>
      <div class="column-item">
        <span class="column-name font-mono text-lg text-night-300">
          {{ usageCount }}
        </span>
      </div>
    </div>
    <divider />
  </div>
</template>
<script>
import CheckBox from "@/components/CheckBox";
import Divider from "@/components/Divider";
export default {
  name: "TableItem",
  methods: {
    check: function () {
      let checkbox = this._vnode.elm.childNodes[0].childNodes[0].childNodes[0];
      if (checkbox.hasAttribute("checked") == true) {
        checkbox.removeAttribute("checked");
      } else {
        checkbox.setAttribute("checked", "true");
      }
    },
  },
  props: {
    componentName: {
      type: String,
      default: "Component",
    },
    usageCount: {
      type: Number,
      default: 0,
    },
  },
  components: {
    CheckBox,
    Divider,
  },
};
</script>
<style scoped>
.column-item {
  width: calc(50% - 14px - 1rem);
}
</style>