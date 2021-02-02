<template>
  <div
    id="table"
    class="bg-cloud overflow-hidden rounded-xl pb-12 shadow-md"
  >
    <div class="px-6 py-6 flex table-head bg-night-200">
      <check-box />
      <div class="column-head-item">
        <span class="column-name font-mono uppercase text-sm text-cloud">
          Component
        </span>
        <font-awesome-icon
          class="text-cloud text-xs"
          :icon="['fas', 'long-arrow-alt-down']"
        />
      </div>
      <div class="column-head-item">
        <span class="column-name font-mono uppercase text-sm text-cloud">
          Usage count
        </span>
        <font-awesome-icon
          class="text-cloud text-xs"
          :icon="['fas', 'long-arrow-alt-down']"
        />
      </div>
    </div>
    <div class="main-content">
      <table-item
        v-for="(component, index) in components"
        :key="index"
        :component-name="component.name"
        :usage-count="component.usageCount"
      />
    </div>
  </div>
</template>
<script>
import CheckBox from "@/components/CheckBox";
import TableItem from "@/components/TableItem";
export default {
  name: "ComponentsTable",
  data() {
    return {
      components: [
        {
          name: "Button",
          usageCount: 1440,
        },
        {
          name: "Navigation",
          usageCount: 144,
        },
        {
          name: "Layout",
          usageCount: 0,
        },
        {
          name: "Checkbox",
          usageCount: 0,
        },
      ],
    };
  },
  components: {
    CheckBox,
    TableItem,
  },
};
</script>
<style scoped>
.column-head-item {
  width: calc(50% - 14px - 1rem);
}
</style>