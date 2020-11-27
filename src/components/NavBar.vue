<template>
  <nav id="nav-bar" class="bg-night-300">
    <div class="nav-wrapper">
      <a class="logo" href="/">
        <img src="../assets/logo.svg" alt="decast logo" />
      </a>
      <ul class="nav-items">
        <li>
          <NavLink link="/" link-text="Dashboard" />
        </li>

        <li>
          <NavLink link="/files" link-text="Files" />
        </li>
        <li>
          <NavLink link="/components" link-text="Components" />
        </li>
      </ul>
    </div>
  </nav>
</template>
<script>
import NavLink from "@/components/NavLink";
export default {
  name: "NavBar",
  components: {
    NavLink,
  },
};
</script>
<style scoped>
#nav-bar {
  padding: 0 24px;
}
.nav-wrapper {
  display: flex;
  justify-content: space-between;
  height: 60px;
  width: 100%;
  align-items: center;
}

.logo {
  height: 44px;
  width: 44px;
}

.nav-items li {
  display: inline-block;
  padding-left: 32px;
}
</style>