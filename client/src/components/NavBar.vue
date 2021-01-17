<template>
  <nav id="nav-bar" class="bg-night-300">
    <div class="nav-wrapper">
      <a class="logo" href="/">
        <img src="../assets/logo.svg" alt="decast logo" />
      </a>
      <ul class="nav-items">
        <li>
          <NavLink link="/dashboard" link-text="Dashboard" />
        </li>
        <li>
          <NavLink link="/artboards" link-text="Artboards" />
        </li>
        <li>
          <NavLink link="/components" link-text="Components" />
        </li>
        <li>
          <button
            @click="exportFiles"
            class="bg-lila-100 text-cloud py-2 px-4 rounded hover:bg-lila-200 transition-color duration-300"
          >
            Export files
          </button>
        </li>
      </ul>
    </div>
  </nav>
</template>
<script>
import NavLink from "@/components/NavLink";
import axios from "axios";
export default {
  name: "NavBar",
  methods: {
    async exportFiles() {
      try {
        const port = process.env.PORT || 3060;
        const protocol = "http";
        const host = "localhost";
        const res = await axios.get(`${protocol}://${host}:${port}/export`, {
          responseType: "blob",
        });
        let fileURL = window.URL.createObjectURL(new Blob([res.data]));
        let fileLink = document.createElement("a");
        fileLink.href = fileURL;
        fileLink.setAttribute("download", "decast.zip");
        document.body.append(fileLink);
        fileLink.click();
        console.log(res);
      } catch (err) {
        console.error(err);
      }
    },
  },
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