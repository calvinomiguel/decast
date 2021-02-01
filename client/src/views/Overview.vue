<template>
  <div>
    <NavBar />
    <nav class="subnav p-6 bg-cloud flex items-center">
      <div class="left-flank">
        <ButtonMenu
          @click.native="changeView($event.currentTarget)"
          class="mr-2 m-nav"
          text="Components"
        />
        <ButtonMenu
          @click.native="changeView($event.currentTarget)"
          class="mr-2 m-nav"
          text="Artboards"
        />
      </div>
      <div class="right-flank flex">
        <Search v-model="inputs.search" />
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
      <div v-show="view.components" class="components inline-flex flex-wrap">
        <div
          v-for="(symbol, index) in cappedSymbols"
          :key="index"
          class="component-wrapper"
        >
          <div
            class="component-img-wrapper border border-greyolett-100 p-8 rounded"
          >
            <img loading="lazy" :src="symbol.imgURL" :alt="symbol.name" />
          </div>
          <h3 class="font-mono font-semibold text-night-300 mt-2">
            {{ symbol.name }}
          </h3>
          <h4 class="font-mono font-medium text-sm text-greyolett-100">
            {{ symbol.sketchFile }}
          </h4>
        </div>
        <ButtonPrimary
          v-show="symbols.length > inputs.symbolsPerPage"
          text="Load more" 
          @click.native="inputs.symbolsPerPage += 16" 
        />
      </div>

      <div class="artboards inline-flex flex-wrap" v-show="view.artboards">
        <div
          v-for="(artboard, index) in cappedArtboards"
          :key="index"
          class="artboard-wrapper"
        >
          <div class="artboard-img-wrapper bg-night-400 px-8 rounded">
            <img :src="artboard.imgURL" :alt="artboard.name" />
          </div>
          <h3 class="font-mono font-semibold text-night-300 mt-2">
            {{ artboard.name }}
          </h3>
          <h4 class="font-mono font-medium text-sm text-greyolett-100">
            {{ artboard.sketchFile }}
          </h4>
        </div>
        <ButtonPrimary
          v-show="artboards.length > inputs.artboardsPerPage"
          text="Load more" 
          @click.native="inputs.artboardsPerPage += 16" 
        />
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
import ButtonPrimary from "@/components/ButtonPrimary";

export default {
  name: "Overview",
  data() {
    return {
      symbols: [],
      artboards: [],
      inputs: {
        symbolsPerPage: 16,
        artboardsPerPage: 16,
        search: "",
      },
      view: {
        components: true,
        artboards: false,
      },
    };
  },
  computed: {
    cappedSymbols() {
      const symbols = [...this.symbols]
      const { symbolsPerPage } = this.inputs

      if(symbols.length > symbolsPerPage) {
        symbols.length = symbolsPerPage
      }

      return symbols
    },
    cappedArtboards() {
      const artboards = [...this.artboards]
      const { artboardsPerPage } = this.inputs

      if(artboards.length > artboardsPerPage) {
        artboards.length = artboardsPerPage
      }

      return artboards
    }
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
            symbol.imgURL = `${protocol}://${host}:${port}/getcomponentimg?do_objectID=${symbol.do_objectID}`;
          }
        }
        this.symbols = symbols;
      } catch (err) {
        console.error(err);
      }
    };

    const getArtboards = async () => {
      try {
        const port = process.env.PORT || 3060;
        const protocol = "http";
        const host = "localhost";
        const res = await axios.get(
          `${protocol}://${host}:${port}/getartboards`
        );
        let artboards;
        if (res.status == 200) {
          artboards = res.data;
          for (let artboard of artboards) {
            artboard.imgURL = `${protocol}://${host}:${port}/getartboardimg?do_objectID=${artboard.do_objectID}`;
          }
        }
        this.artboards = artboards;
      } catch (err) {
        console.error(err);
      }
    };
    getComponents();
    getArtboards();
  },
  methods: {
    changeView(event) {
      if (event.innerText == "Components".toUpperCase()) {
        if (this.view.components != true) {
          this.view.artboards = false;
          this.view.components = true;
        }
      }
      if (event.innerText == "Artboards".toUpperCase()) {
        if (this.view.artboards != true) {
          this.view.components = false;
          this.view.artboards = true;
        }
      }
    },
    filteredSymbols() {
      const symbols = this.symbols;
      const search = this.inputs.search;

      if (!this.inputs.search) return symbols;

      return symbols.filter((symbol) => {
        return symbol.name.toLowerCase().includes(search.toLowerCase());
      });
    },
    filteredArtboards() {
      const symbols = this.artboards;
      const search = this.inputs.search;

      if (!this.inputs.search) return symbols;

      return symbols.filter((symbol) => {
        return symbol.name.toLowerCase().includes(search.toLowerCase());
      });
    },
  },
  components: {
    NavBar,
    ButtonMenu,
    Search,
    ButtonOrganizer,
    ButtonPrimary,
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
.artboards,
.components {
  padding: 32px 24px 72px 24px;
  height: 100%;
  width: 100%;
  overflow: scroll;
  gap: calc(4% / 6);
}

.artboard-wrapper,
.component-wrapper {
  max-width: calc(96% / 4);
  width: 100%;
  margin-bottom: 1.5rem;
}

.artboard-img-wrapper,
.component-img-wrapper {
  position: relative;
  width: 100%;
  height: 280px;
}

.artboard-img-wrapper > img {
  position: relative;
  width: 100%;
  object-fit: contain;
  height: 100%;
}
.component-img-wrapper > img {
  transform: translate(-50%, -50%);
  position: relative;
  top: 50%;
  left: 50%;
  max-height: 100%;
}
</style>