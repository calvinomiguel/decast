<template>
  <label class="flex justify-start cursor-pointer items-center bg-night-200 shadow rounded h-20 px-6 flex items-center">
    <div
      id="checkbox"
      class="bg-night-200 border-1 rounded-sm w-6 h-6 flex flex-shrink-0 justify-center items-center mr-4"
    >
      <input
        type="checkbox"
        class="opacity-0 absolute"
      >
      <svg
        class="fill-current hidden w-4 h-4 pointer-events-none"
        viewBox="0 0 20 20"
      >
        <path
          d="M0 11l2-2 5 5L18 3l2 2L7 18z"
          fill="#BBFF00"
        />
      </svg>
    </div>
    <div class="select-none text-cloud font-mono font-light text-lg">
      Label Text
    </div>
  </label>
</template>
<script>
export default {
  name: "ComponentListItem",
};
</script>
<style scoped>
input:checked + svg {
  display: block;
}

#checkbox {
  border: 1px solid #ffffff;
}
</style>