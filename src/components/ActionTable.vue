<template>
  <div id="action-table" class="bg-night-200 rounded pt-6 pr-6 pl-6 pb-18">
    <h3 class="table-title font-mono text-cloud font-bold text-2xl mb-4">
      Dead Components
    </h3>
    <div class="divider"></div>
    <div class="rows-container">
      <div
        class="row text-cloud font-body pt-5 pb-1 flex justify-between items-center"
      >
        <span class="row-description">Remove dead components</span>
        <span class="row-chevron text-2xl">›</span>
      </div>
      <div class="divider"></div>
      <div
        class="row text-cloud font-body pt-5 pb-1 flex justify-between items-center"
      >
        <span class="row-description">Remove dead components</span>
        <span class="row-chevron text-2xl">›</span>
      </div>
      <div class="divider"></div>
      <div
        class="row text-cloud font-body pt-5 pb-1 flex justify-between items-center"
      >
        <span class="row-description">Remove dead components</span>
        <span class="row-chevron text-2xl">›</span>
      </div>
      <div class="divider"></div>
      <div
        class="row text-cloud font-body pt-5 pb-1 flex justify-between items-center"
      >
        <span class="row-description">Remove dead components</span>
        <span class="row-chevron text-2xl">›</span>
      </div>
      <div class="divider"></div>
      <div
        class="row text-cloud font-body pt-5 pb-1 flex justify-between items-center"
      >
        <span class="row-description">Remove dead components</span>
        <span class="row-chevron text-2xl">›</span>
      </div>
      <div class="divider"></div>
    </div>
  </div>
</template>
<script>
export default {
  name: "ActionTable",
  data() {
    return {
      recommendations: [
        {
          status: true,
          message: "Remove dead components",
        },
        {
          status: true,
          message: "Remove less used components",
        },
        {
          status: true,
          message: "Check duplicate components",
        },
      ],
      defaultMessage: "Seems like everything is fine",
      generalStats: {
        totalComponents: 9630,
        totalDead: 963,
      },
    };
  },
  methods: {},
  computed: {
    enabledRecommendations() {
      return this.recommendations.filter((i) => i.status == true);
    },
  },
};
</script>
<style>
#action-table {
  max-width: 608px;
  position: relative;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  height: 444px;
}
.divider {
  width: 100%;
  border-bottom: 1px solid theme("colors.cloud");
}
</style>