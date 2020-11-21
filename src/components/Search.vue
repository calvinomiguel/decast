<template>
  <div class="search-container px-6 shadow-lg items-center h-16 rounded focus:outline-none bg-cloud flex focus:shadow-outline">
    <div class="search-icon-container">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24.078"
        height="24.08"
        viewBox="0 0 24.078 24.08"
      >
        <path
          id="search-icon"
          data-name="search-icon"
          d="M23.561,23.561a1.5,1.5,0,0,0,0-2.122L19.2,17.077a.5.5,0,0,1-.058-.638,10.54,10.54,0,1,0-2.7,2.7.5.5,0,0,1,.638.058l4.362,4.363a1.5,1.5,0,0,0,2.122,0ZM2,10.5A8.5,8.5,0,1,1,10.5,19,8.5,8.5,0,0,1,2,10.5Z"
          transform="translate(0.078 0.081)"
          fill="#26292e"
        />
      </svg>
    </div>
    <input
      class="w-full h-16 text-xl pl-6 focus:outline-none font-mono text-base"
      type="search"
      placeholder="Search..."
    />
  </div>
</template>
<script>
export default {
  name: "Search",
};
</script>