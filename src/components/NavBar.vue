<template>
  <nav id="nav-bar" class="bg-night-300">
    <div class="nav-wrapper flex justify-between items-center">
      <a href="">
        <img src="@/assets/img/decast-logo.png" alt="" />
      </a>
      <ul class="nav-links text-cloud">
        <li>
          <a
            class="font-mono hover:text-night-100 duration-360 ease-in-out"
            href=""
            >Dashboard</a
          >
        </li>
        <li>
          <a
            class="font-mono hover:text-night-100 duration-360 ease-in-out"
            href=""
            >Files</a
          >
        </li>
        <li>
          <a
            class="font-mono hover:text-night-100 duration-360 ease-in-out"
            href=""
            >Components</a
          >
        </li>
      </ul>
    </div>
  </nav>
</template>>
<style >
#nav-bar {
  height: 72px;
}

.nav-wrapper {
  max-width: 1224px;
  position: relative;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.nav-links li {
  display: inline-block;
  padding-left: 32px;
}
</style>