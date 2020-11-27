<template>
  <div
    class="search-container px-4 border-night-100 border items-center h-10 rounded focus:outline-none bg-dark-100 flex"
  >
    <div class="search-icon-container">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
      >
        <path
          id="search-icon"
          data-name="search-icon"
          d="M23.561,23.561a1.5,1.5,0,0,0,0-2.122L19.2,17.077a.5.5,0,0,1-.058-.638,10.54,10.54,0,1,0-2.7,2.7.5.5,0,0,1,.638.058l4.362,4.363a1.5,1.5,0,0,0,2.122,0ZM2,10.5A8.5,8.5,0,1,1,10.5,19,8.5,8.5,0,0,1,2,10.5Z"
          transform="translate(0.078 0.081)"
          fill="#99aab5"
        />
      </svg>
    </div>
    <input
      v-on:focus="focus"
      v-on:focusout="focusOut"
      class="w-full bg-smokey h-8 pl-4 focus:outline-none font-mono placeholder-night-100"
      type="search"
      placeholder="Search..."
    />
  </div>
</template>
<script>
export default {
  name: "Search",
  methods: {
    focus: function () {
      let container = document.querySelector(".search-container");
      container.classList.remove("border-night-100");
      container.classList.add("border-lila-100");
      container.style.boxShadow = "0px 0px 1px 2px rgb(133 109 231 / 0.32)";
    },
    focusOut: function () {
      let container = document.querySelector(".search-container");
      container.classList.add("border-night-100");
      container.classList.remove("border-lila-100");
      container.style.boxShadow = "none";
    },
  },
};
</script>
<style scoped>
input::placeholder {
  text-transform: uppercase;
  font-weight: bold;
  font-size: 14px;
}
</style>