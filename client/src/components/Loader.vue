<template>
  <div class="loader bg-lila-100">
    <div class="ring-container">
      <div class="lds-dual-ring"></div>
      <p class="loading-text font-mono text-cloud font-bold text-center mt-12 text-xl">{{ loadingText }}</p>
    </div>
  </div>
</template>
<script>
export default {
  name: "Loader",
  props: {
    loadingText: {
      type: String,
      default: "Do not close the window. We are currently loading your sketch files. This may take a few minutes depending on the project size.",
    },
  },
};
</script>
<style scoped>
.loading-text {
    padding:0 24px;
    position: relative;
    left: 50%;
    transform: translate(-50%);
}
.loader {
  position: fixed;
  height: 100vh;
  width: 100vw;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
.lds-dual-ring {
  display: inline-block;
  width: 280px;
  height: 280px;
  position: relative;
  left: 50%;
  transform: translate(-50%);
}
.lds-dual-ring:after {
  content: " ";
  display: block;
  width: 100%;
  height: 100%;
  margin: 8px;
  border-radius: 50%;
  border: 6px solid #fff;
  border-color: #fff transparent #fff transparent;
  animation: lds-dual-ring 2s linear infinite;
}
@keyframes lds-dual-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>