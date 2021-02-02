<template>
  <div>
    <div
      v-show="showBgLayer"
      @click="closeLightbox"
      id="bg-layer"
      class="bg-layer bg-night-400 bg-opacity-75"
    />
    <div
      @click="closeLightbox"
      v-show="showArtboardInLightbox"
      class="bg-container"
    >
      <button @click="closeLightbox" class="text-cloud text-5xl close-lightbox">
        ×
      </button>
      <div v-show="showArtboardInLightbox" class="artboard-container">
        <img loading="lazy" :src="currentArtboardImg" alt="Artboard" />
      </div>
    </div>
    <div
      v-show="showSortModal"
      class="font-mono sort-modal bg-cloud w-full pb-4"
    >
      <div class="sort-header bg-night-400 border-b-2">
        <div class="header-wrapper flex items-center justify-between px-4 py-2">
          <p class="text-lg text-cloud">Sort</p>
          <button @click="closeSort" class="text-2xl text-cloud">×</button>
        </div>
      </div>
      <button
        @click="sort($event.currentTarget)"
        id="ab-high"
        class="filter-btn mt-4"
      >
        A – Z
      </button>
      <button
        @click="sort($event.currentTarget)"
        id="ab-low"
        class="filter-btn"
      >
        Z – A
      </button>
    </div>
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
            @click.native="showSort"
            class="sort-components"
            alt="Sort icon"
            file-name="sort-icon.png"
            btn-text="Sort"
          />
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
          @click="showLightbox($event)"
          v-for="(artboard, index) in cappedArtboards"
          :key="index"
          class="artboard-wrapper p-3 rounded-lg hover:border-greyolett-100 border transition-all duration-300 mb-3"
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
      symbolsStore: [],
      artboards: [],
      showBgLayer: false,
      showArtboardInLightbox: false,
      showSortModal: false,
      currentArtboardImg: null,
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
      const symbols = [...this.symbols];
      const { symbolsPerPage } = this.inputs;

      if (symbols.length > symbolsPerPage) {
        symbols.length = symbolsPerPage;
      }

      return symbols;
    },
    cappedArtboards() {
      const artboards = [...this.artboards];
      const { artboardsPerPage } = this.inputs;

      if (artboards.length > artboardsPerPage) {
        artboards.length = artboardsPerPage;
      }

      return artboards;
    },
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
    getComponents();
  },
  methods: {
    async getArtboards() {
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
    },
    sort(event) {
      let element = event.getAttribute("id");
      if (this.view.components == true) {
        console.log(this.artboards);
        //Sort from a to z
        if (element == "ab-high") {
          this.symbols.sort((a, b) => a.name.localeCompare(b.name));
        }

        //Sort from z to a
        if (element == "ab-low") {
          this.symbols.sort((a, b) => b.name.localeCompare(a.name));
        }

        this.symbols.length == 0
          ? (this.showNoResults = true)
          : (this.showNoResults = false);
        this.showBgLayer = false;
        this.showSortModal = false;
      }
      if (this.view.artboards == true) {
        //Sort from a to z
        if (element == "ab-high") {
          this.artboards.sort((a, b) => a.name.localeCompare(b.name));
        }

        //Sort from z to a
        if (element == "ab-low") {
          this.artboards.sort((a, b) => b.name.localeCompare(a.name));
        }

        this.artboards.length == 0
          ? (this.showNoResults = true)
          : (this.showNoResults = false);
        this.showBgLayer = false;
        this.showSortModal = false;
      }
    },
    closeSort() {
      this.showSortModal = false;
      this.showBgLayer = false;
    },
    showSort() {
      this.showBgLayer = true;
      this.showSortModal = true;
    },
    closeLightbox() {
      this.showBgLayer = false;
      this.showArtboardInLightbox = false;
      this.showSortModal = false;
      this.showFilterModal = false;
    },
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
          this.getArtboards();
        }
      }
    },
    showLightbox(event) {
      console.log(event.currentTarget.childNodes);
      this.currentArtboardImg =
        event.currentTarget.childNodes[0].childNodes[0].currentSrc;
      this.showBgLayer = true;
      this.showArtboardInLightbox = true;
    },
    filteredElements() {
      if (this.view.components == true) {
        const symbols = this.symbols;
        const search = this.inputs.search;

        if (!this.inputs.search) return symbols;

        return symbols.filter((symbol) => {
          return symbol.name.toLowerCase().includes(search.toLowerCase());
        });
      }

      if (this.view.artboards == true) {
        const artboards = this.artboards;
        const search = this.inputs.search;

        if (!this.inputs.search) return artboards;

        return artboards.filter((artboard) => {
          return artboard.name.toLowerCase().includes(search.toLowerCase());
        });
      }
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
  max-width: 168px;
  width: 100%;
  justify-content: space-between;
}
.search-container {
  max-width: 352px;
  width: 100%;
}
.organizer-wrapper > button {
  width: 100%;
}
.right-flank {
  max-width: 720px;
  width: 100%;
  justify-content: flex-end;
  gap: 1rem;
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

.artboard-wrapper {
  cursor: pointer;
}
.bg-layer {
  height: 100vh;
  width: 100vw;
  position: fixed;
  z-index: 1;
  padding: 0 4rem;
}

.bg-container {
  height: 100%;
  width: 100%;
  position: relative;
  padding: 4rem 0;
  position: fixed;
  z-index: 2;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.close-lightbox {
  position: absolute;
  right: 0;
}

.artboard-container {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  height: 100%;
  overflow: scroll;
}

.artboard-container > img {
  position: relative;
  top: 50%;
  transform: translateY(-50%);
}
.sort-modal {
  max-width: 720px;
  border-radius: 0.25rem;
  position: fixed;
  z-index: 2;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.sort-header {
  border-radius: 0.25rem 0.25rem 0 0;
}

.filter-btn {
  width: 100%;
  display: block;
  height: 60px;
  transition: background-color 360ms ease-in-out;
}

.filter-btn:hover {
  background-color: theme("colors.smokey");
}
</style>