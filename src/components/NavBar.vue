<template>
  <nav id="nav-bar" class="bg-night-400">
    <div class="nav-wrapper">
      <a class="logo" href="">
        <img
          src="https://raw.githubusercontent.com/webpack/media/master/logo/icon-square-big.png"
          alt="decast logo"
        />
      </a>
      <ul class="nav-items">
        <li><a class="font-mono text-cloud" href="">Dashboard</a></li>
        <li><a class="font-mono text-cloud" href="">Files</a></li>
        <li><a class="font-mono text-cloud" href="">Components</a></li>
      </ul>
    </div>
  </nav>
</template>
<script>
export default {
  name: "NavBar",
};
</script>
<style scoped>
.nav-wrapper {
  max-width: 1224px;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: space-between;
  height: 72px;
  width: 100%;
  align-items: center;
}

.logo {
  height: 52px;
  width: 52px;
}

.nav-items li {
  display: inline-block;
  padding-left: 32px;
}
</style>