<template>
  <div>
    <NavBar />
    <nav class="subnav p-6 bg-cloud flex items-center">
      <div class="left-flank">
        <ButtonMenu class="mr-2 m-nav" text="Components" />
        <ButtonMenu class="mr-2 m-nav" text="Dashboards" />
      </div>
      <div class="right-flank flex">
        <Search />
        <div class="organizer-wrapper flex">
          <ButtonOrganizer
            class="sort-components"
            alt="Sort icon"
            fileName="sort-icon.png"
            btn-text="Sort"
          />
          <ButtonOrganizer alt="Filter icon" btn-text="Filter" />
        </div>
      </div>
    </nav>
    <main>
      <div class="components inline-flex flex-wrap">
        <div
          v-for="(symbol, index) in symbols"
          :key="index"
          class="component-wrapper"
        >
          <div
            class="component-img-wrapper border border-greyolett-100 p-8 rounded"
          >
            <img :src="symbol.imgURL" alt="" />
          </div>
          <h3 class="font-mono font-semibold text-night-300 mt-2">
            {{ symbol.name }}
          </h3>
          <h4 class="font-mono font-medium text-sm text-greyolett-100">
            {{ symbol.sketchFile }}
          </h4>
        </div>
      </div>
    </main>
  </div>
</template>
<script>
import NavBar from "@/components/NavBar";
import ButtonMenu from "@/components/ButtonMenu";
import Search from "@/components/Search";
import ButtonOrganizer from "@/components/ButtonOrganizer";
import axios from "axios";
export default {
  name: "Overview",
  data() {
    return {
      symbols: [],
      artboards: [],
    };
  },
  mounted() {
    const getComponents = async () => {
      try {
        const port = process.env.PORT || 3060;
        const protocol = "http";
        const host = "localhost";
        const res = await axios.get(
          `${protocol}://${host}:${port}/getcomponents`
        );
        let symbols;
        if (res.status == 200) {
          symbols = res.data;
          for (let symbol of symbols) {
            const response = await axios.get(
              `${protocol}://${host}:${port}/getcomponentimg`,
              {
                params: {
                  do_objectID: symbol.do_objectID,
                },
              }
            );

            if (response.headers["content-type"] == "image/png") {
              symbol.imgURL = response.request.responseURL;
              console.log(response);
            }
          }
        }
        this.symbols = symbols;
      } catch (err) {
        console.error(err);
      }
    };
    getComponents();
  },

  components: {
    NavBar,
    ButtonMenu,
    Search,
    ButtonOrganizer,
  },
};
</script>
<style scoped>
.subnav {
  justify-content: space-between;
}
.organizer-wrapper {
  max-width: 352px;
  width: 100%;
  justify-content: space-between;
}
.search-container {
  max-width: 352px;
  width: 100%;
}
.organizer-wrapper > button {
  max-width: calc(96% / 2);
}
.right-flank {
  max-width: 720px;
  width: 100%;
  justify-content: space-between;
}
main {
  height: calc(100vh - 5.5rem - 60px);
  overflow: hidden;
}

.components {
  padding: 32px 24px 72px 24px;
  height: 100%;
  width: 100%;
  overflow: scroll;
  gap: calc(4% / 6);
}

.component-wrapper {
  max-width: calc(96% / 4);
  width: 100%;
  margin-bottom: 1.5rem;
}

.component-img-wrapper {
  position: relative;
  width: 100%;
  height: 280px;
}

.component-img-wrapper > img {
  position: relative;
  width: 100%;
  object-fit: contain;
  height: 100%;
}
</style>