<template>
  <div>
    <Loader v-show="showLoader" :loading-text="loaderMessage" />
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
          <p class="text-lg text-cloud">Sort components</p>
          <button @click="closeSort" class="text-2xl text-cloud">×</button>
        </div>
      </div>
      <button
        @click="sortComponents($event.currentTarget)"
        id="ab-high"
        class="filter-btn mt-4"
      >
        A – Z
      </button>
      <button
        @click="sortComponents($event.currentTarget)"
        id="ab-low"
        class="filter-btn"
      >
        Z – A
      </button>
      <button
        @click="sortComponents($event.currentTarget)"
        id="num-down"
        class="filter-btn"
      >
        Most used – Less used
      </button>
      <button
        @click="sortComponents($event.currentTarget)"
        id="num-high"
        class="filter-btn"
      >
        Less used – Most used
      </button>
    </div>
    <div v-show="showFilterModal" class="font-mono sort-modal bg-cloud w-full">
      <div class="sort-header bg-night-400 border-b-2">
        <div class="header-wrapper flex items-center justify-between px-4 py-2">
          <p class="text-lg text-cloud">Filter components</p>
          <button @click="closeFilter" class="text-2xl text-cloud">×</button>
        </div>
      </div>
      <h3
        class="text-night-400 text-center uppercase font-mono text-xs font-bold mt-8"
      >
        By redundancies
      </h3>
      <button
        @click="sortComponents($event.currentTarget)"
        id="duplicate"
        class="filter-btn border-b-2 mt-4"
      >
        Duplicate names
      </button>
      <h3
        class="text-night-400 text-center uppercase font-mono text-xs font-bold mt-8"
      >
        By numbers
      </h3>
      <button
        @click="sortComponents($event.currentTarget)"
        id="0"
        class="filter-btn mt-4"
      >
        0
      </button>
      <button
        @click="sortComponents($event.currentTarget)"
        id="to5"
        class="filter-btn"
      >
        1 – 5
      </button>
      <button
        @click="sortComponents($event.currentTarget)"
        id="to10"
        class="filter-btn"
      >
        6 – 10
      </button>
      <button
        @click="sortComponents($event.currentTarget)"
        id="to50"
        class="filter-btn"
      >
        11 – 50
      </button>
      <button
        @click="sortComponents($event.currentTarget)"
        id="to100"
        class="filter-btn"
      >
        51 – 100
      </button>
      <button
        @click="sortComponents($event.currentTarget)"
        id="to500"
        class="filter-btn"
      >
        101 – 500
      </button>
      <button
        @click="sortComponents($event.currentTarget)"
        id="500>"
        class="filter-btn mb-4"
      >
        500 >
      </button>

      <button
        @click="sortComponents($event.currentTarget)"
        id="unfilter"
        class="w-full p-4 bg-lila-100 text-cloud transition-colors duration-500 ease-in-out hover:bg-lila-200"
      >
        Remove filter
      </button>
    </div>
    <NavBar />
    <div class="main-container flex">
      <aside class="aside bg-smokey">
        <div class="aside-wrapper">
          <Search v-model="inputs.search" />
          <div class="organizer-wrapper flex justify-between mt-3">
            <ButtonOrganizer
              @click.native="showSort"
              class="sort-components"
              alt="Sort icon"
              file-name="sort-icon.png"
              btn-text="Sort"
            />
            <ButtonOrganizer
              @click.native="showFilter"
              alt="Filter icon"
              btn-text="Filter"
            />
          </div>
          <div
            class="select-wrapper flex-wrap ml-4 mt-8 flex justify-between w-full items-center"
          >
            <label class="label-container flex align-center font-mono">
              <div class="checkbox-wrapper">
                <input
                  @click="selectAllComponents($event)"
                  class="checkbox-input"
                  type="checkbox"
                />
                <span
                  class="rounded flex align-center items-center justify-center checkmark checkboxStyle"
                />
              </div>
              <span class="items-center flex ml-2 label"> Select All </span>
            </label>
            <button
              @click="deleteAllComponents"
              v-show="showDeleteAll"
              class="delete-btn inline-block mr-8"
            >
              <img src="../assets/delete-icon.svg" alt="Delete icon" />
            </button>

            <p
              v-show="showSelectionAmount"
              class="font-mono w-full mr-4 mt-4 w-full text-right text-greyolett-100 font-semibold text-xs uppercase"
            >
              {{ selectionAmount }} item(s) selected
            </p>
          </div>
          <div class="components-list mt-4">
            <div
              v-show="showNoResults"
              class="py-8 px-6 rounded border-greyolett-100 mt-16 border"
            >
              <font-awesome-icon
                class="fai text-greyolett-100 text-4xl mb-2"
                :icon="['fas', 'search']"
              />
              <h3
                class="font-mono font-bold text-night-300 text-xl text-center mb-3"
              >
                Nothing found
              </h3>
              <p class="font-mono text-night-200 text-center">
                No results match your query, try something else.
              </p>
            </div>

            <ListCard
              @click.native="selectComponent"
              v-for="(symbol, index) in filteredSymbols"
              :original-file-name="symbol.originalFileName"
              :current-file-name="symbol.currentFileName"
              :key="index"
              :name="symbol.name"
              :count="symbol.count"
              :id="symbol.do_objectID"
              :original-master-id="symbol.originalMasterId"
              :symbol-ids="symbol.symbolIDs"
              class="mb-2 border-lila-200"
              @delete="onDelete(symbol)"
            />
          </div>
        </div>
      </aside>
      <main class="main bg-cloud w-full">
        <div
          v-show="showEmpty"
          class="empty-state h-full w-full flex items-center justify-center bg-cloud"
        >
          <div class="txt-container">
            <img
              loading="lazy"
              class="empty-state-illustration mb-8"
              :src="require('@/assets/components.svg')"
              alt="Components Icon"
            />
            <h3 class="font-mono font-bold text-2xl text-center text-night-300">
              Start by selecting a component
            </h3>
            <p class="font-mono text-night-100 text-center">
              By selecting a component you can preview it, see its statistics or
              its usage context.
            </p>
          </div>
        </div>
        <div v-show="showMain" class="main-wrapper px-5 py-6">
          <div class="main-head">
            <h1 class="font-mono font-bold text-4xl mb-3">
              {{ componentName }}
            </h1>
            <ButtonMenu
              @click.native="changeView"
              id="c"
              class="mr-2 m-nav"
              text="Component"
            />
            <ButtonMenu
              @click.native="changeView"
              id="s"
              class="mr-2 m-nav"
              text="Stats"
            />
            <ButtonMenu
              @click.native="changeView"
              id="u"
              text="Usage context"
              class="m-nav"
            />
            <Divider class="mt-6" />
          </div>
          <div class="content-view mt-6 pb-6">
            <div
              v-show="view.c"
              class="bg-smokey h-full w-full flex items-center justify-center px-4 py-4 rounded"
            >
              <div
                v-show="showError"
                class="txt-container w-full preview-error"
              >
                <h2
                  class="font-mono w-full font-bold text-2xl text-center text-night-300"
                >
                  Root file not found
                </h2>
                <p class="w-full font-mono text-night-100 text-center">
                  In order to preview this component you need to upload
                  <span class="code-tag">{{ rootFile }}</span
                  >. In general we recommend to always upload all project files
                  to prevent such occurences.
                </p>
              </div>
              <ComponentPreview
                v-show="view.cp"
                :img-path="
                  imgPath.status == false
                    ? require('@/assets/img/Ajax-Preloader.gif')
                    : imgPath.img
                "
              />
            </div>
            <div class="s-view-wrapper pb-24">
              <div class="s-view" v-show="view.s">
                <h2 class="font-mono font-bold text-2xl text-night-300">
                  Scope of use
                </h2>
                <div class="chart-container flex justify-center py-24">
                  <pie-chart
                    id="pie-chart"
                    width="240px"
                    height="240px"
                    :data="[
                      ['Arboards using component', artboardsUsingComponent],
                      [
                        'Artboards not using component',
                        totalArtboards - artboardsUsingComponent,
                      ],
                    ]"
                    :colors="colors"
                    :legend="false"
                  />
                </div>
                <div class="chart-context">
                  <div class="context-table justify-between flex">
                    <div class="context-row">
                      <div class="row-wrapper flex justify-between">
                        <div class="row-text">
                          <h4 class="text-night-300 font-mono">
                            Artboards not using component
                          </h4>
                          <p class="font-bold text-night-300 mt-2 font-mono">
                            {{ totalArtboards - artboardsUsingComponent }}
                          </p>
                        </div>
                        <div class="tag bg-night-400" />
                      </div>
                      <Divider class="mt-2 mb-6 w-full" />
                      <div class="row-wrapper flex justify-between">
                        <div class="row-text">
                          <h4 class="text-night-300 font-mono">
                            Artboards using component
                          </h4>
                          <p class="font-bold text-night-300 mt-2 font-mono">
                            {{ artboardsUsingComponent }}
                          </p>
                        </div>
                        <div class="tag bg-lila-100" />
                      </div>
                      <Divider class="mt-2 mb-6 w-full" />
                      <div class="row-wrapper flex justify-between">
                        <div class="row-text">
                          <h4 class="text-night-300 font-mono">
                            Total artboards
                          </h4>
                          <p class="font-bold text-night-300 mt-2 font-mono">
                            {{ totalArtboards }}
                          </p>
                        </div>
                      </div>
                      <Divider class="mt-2 mb-6 w-full" />
                      <h3
                        class="font-mono text-xl text-right text-night-300 mt-4"
                      >
                        Distribution of use
                      </h3>
                      <p
                        class="font-mono text-night-300 text-xl text-right font-bold"
                      >
                        {{ degreeOfUse }}%
                      </p>
                    </div>
                    <div class="context-row">
                      <div class="row-wrapper flex justify-between">
                        <div class="row-text">
                          <h4 class="text-night-300 font-mono">
                            Component instances
                          </h4>
                          <p class="font-bold text-night-300 mt-2 font-mono">
                            {{ symbolCount }}
                          </p>
                        </div>
                      </div>
                      <Divider class="mt-2 mb-6 w-full" />
                    </div>
                  </div>
                </div>
                <h2
                  v-show="artboards.length > 0"
                  class="font-mono font-bold text-2xl mt-24 text-night-300"
                >
                  Artboards
                </h2>
                <div v-show="artboards.length > 0" class="artboard-table mt-10">
                  <div
                    v-for="(artboard, index) in artboards"
                    :key="index"
                    class="artboard-row mb-3"
                  >
                    <div class="flex justify-between">
                      <div class="artboard-name font-mono text-night-300">
                        {{ artboard.name }}
                      </div>
                      <div
                        class="usage-count text-night-300 font-mono text-right font-bold"
                      >
                        {{ artboard.symbolInstancesCount }}
                      </div>
                    </div>
                    <Divider class="mt-3" />
                  </div>
                  <div class="artboard-row mt-6">
                    <div class="flex justify-between">
                      <div
                        class="artboard-name font-mono text-2xl text-night-300"
                      >
                        Total usage
                      </div>
                      <div
                        class="usage-count text-night-300 font-mono text-2xl text-right font-bold"
                      >
                        {{ totalArtboardsUsage }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="u-view" v-show="view.u">
              <div class="artboards-view inline-flex flex-wrap">
                <div
                  v-for="(artboard, index) in artboards"
                  :key="index"
                  @click="showLightbox(artboard)"
                  class="artboard p-3 rounded-lg hover:border-greyolett-100 border transition-all duration-300 mb-3"
                >
                  <div
                    class="artboard-img border border-night-100 overflow-hidden rounded"
                  >
                    <img loading="lazy" :src="artboard.path" alt="" />
                  </div>
                  <h3 class="font-mono text-night-300 mt-2 font-bold">
                    {{ artboard.name }}
                  </h3>
                  <h4 class="font-mono text-greyolett-100 text-sm font-medium">
                    {{ artboard.sketchFile }}
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
<script>
import Search from "@/components/Search";
import NavBar from "@/components/NavBar";
import ButtonOrganizer from "@/components/ButtonOrganizer";
import ListCard from "@/components/ListCard";
import ButtonMenu from "@/components/ButtonMenu";
import Divider from "@/components/Divider";
import ComponentPreview from "@/components/ComponentPreview";
import Loader from "@/components/Loader";
import axios from "axios";
export default {
  name: "Components",
  data() {
    return {
      artboards: [],
      showSelectionAmount: false,
      selectionAmount: 0,
      selectAllChecked: null,
      selectAllSymbols: false,
      selectInput: null,
      showLoader: false,
      loaderMessage: null,
      showNoResults: false,
      currentArtboardImg: null,
      showDeleteAll: false,
      showArtboardInLightbox: false,
      showBgLayer: false,
      showMain: false,
      showError: false,
      showSortModal: false,
      showFilterModal: false,
      rootFile: null,
      showEmpty: true,
      view: {
        c: false,
        s: false,
        u: false,
        cp: false,
      },
      imgPath: {
        status: false,
        img: null,
      },
      componentName: null,
      componentsList: [],
      totalArtboards: 0,
      artboardsUsingComponent: 0,
      colors: ["#856de7", "#23272a"],
      currentComponent: {
        name: null,
        id: null,
        originalMasterId: null,
        symbolIds: null,
        originalFileName: null,
        currentFileName: null,
      },
      data: null,
      inputs: {
        search: "",
      },
      symbols: [],
      symbolsStore: [],
      totalSymbols: 0,
      artboardsData: null,
      symbolCount: 0,
      totalArtboardsUsage: 0,
    };
  },
  mounted() {
    const getData = async () => {
      try {
        const port = process.env.PORT || 3060;
        const protocol = "http";
        const host = "localhost";
        const res = await axios.get(`${protocol}://${host}:${port}/data`);
        let data = res.data;
        this.data = data;
        let symbols = data.symbols;
        this.totalSymbols = data.totalSymbols;
        symbols.forEach((symbol) => {
          this.symbols.push(symbol);
        });
        this.symbolsStore = this.symbols;
      } catch (err) {
        console.error(err);
      }
    };
    const getArtboardData = async () => {
      try {
        const port = process.env.PORT || 3060;
        const protocol = "http";
        const host = "localhost";
        const res = await axios.get(
          `${protocol}://${host}:${port}/artboards/data`
        );
        this.artboardsData = res.data;
        //console.log(this.artboardsData.artboards);
      } catch (err) {
        console.error(err);
      }
    };
    (async () => {
      await getData();
      await getArtboardData();
    })();
  },
  methods: {
    async deleteAllComponents() {
      let symbols = this.symbols;
      let amountToDelete = symbols.length;
      let result = confirm(
        "Are your sure you want to delete " + amountToDelete + " components?"
      );

      if (result == true) {
        this.showLoader = true;
        this.loaderMessage = `${amountToDelete} component(s) are being removed from all of your sketch files.`;
        try {
          const protocol = "http";
          const host = "localhost";
          const port = process.env.PORT || 3060;
          const res = await axios.post(
            `${protocol}://${host}:${port}/delete/symbols/`,
            {
              params: {
                symbols: symbols,
              },
            }
          );
          console.log("Hi");
          console.log(res.data);
          if (res.status == 200) {
            this.showLoader = false;
            location.reload();
          }
        } catch (err) {
          console.error(err);
        }
      }

      console.log(result);
      console.log(symbols);
    },
    selectAllComponents(event) {
      this.selectAllSymbols = !this.selectAllSymbols;
      this.showSelectionAmount = this.selectAllSymbols;
      this.showDeleteAll = this.selectAllSymbols;
      this.selectAllChecked = event.currentTarget;

      let list =
        event.currentTarget.parentNode.parentNode.parentNode.parentNode
          .childNodes[3].childNodes;

      this.componentsList = [];
      list.forEach((element) => {
        if (element.classList.contains("list-card")) {
          this.componentsList.push(element);
        }
      });

      if (this.selectAllSymbols == true) {
        this.componentsList.forEach((component) => {
          component.classList.add("border-2", "border-lila-100");
        });
      }
      if (this.selectAllSymbols == false) {
        this.componentsList.forEach((component) => {
          component.classList.remove("border-2", "border-lila-100");
        });
      }

      this.selectionAmount = this.componentsList.length;
    },
    async onDelete(symbol) {
      let result = confirm("Are your sure you want to delete " + symbol.name);
      if (result) {
        this.showLoader = true;
        this.loaderMessage = `${symbol.name} is being removed from all files.`;
        let originalMasterId = symbol.originalMasterId;
        let symbolIds = symbol.symbolIDs;
        try {
          const protocol = "http";
          const host = "localhost";
          const port = process.env.PORT || 3060;
          const res = await axios.post(
            `${protocol}://${host}:${port}/delete/symbol`,
            {
              params: {
                originalMasterId: originalMasterId,
                symbolIds: symbolIds,
              },
            }
          );
          if (res.status == 200) {
            this.showLoader = false;
            location.reload();
          }
          console.log(res.data);
        } catch (err) {
          console.error(err);
        }
      }
    },
    sortComponents(event) {
      let element = event.getAttribute("id");

      //Sort from a to z
      if (element == "ab-high") {
        this.symbols.sort((a, b) => a.name.localeCompare(b.name));
      }

      //Sort from z to a
      if (element == "ab-low") {
        this.symbols.sort((a, b) => b.name.localeCompare(a.name));
      }

      //Sort from highest to lowest count
      if (element == "num-down") {
        this.symbols.sort((a, b) => b.count - a.count);
      }

      //Sort from lowest to highest count
      if (element == "num-high") {
        this.symbols.sort((a, b) => a.count - b.count);
      }

      //Remove filter
      if (element == "unfilter") {
        this.symbols = this.symbolsStore;
      }

      //Filter all symbols with zero counts
      if (element == "0") {
        this.symbols = this.symbolsStore;
        let symbols = this.symbols.filter((a) => a.count == 0);
        this.symbols = symbols;
      }

      //Filter all symbols  from 0 - 5 counts
      if (element == "to5") {
        this.symbols = this.symbolsStore;
        let symbols = this.symbols.filter((a) => a.count < 6);
        this.symbols = symbols;
      }

      //Filter all symbols  from 0 - 10 counts
      if (element == "to10") {
        this.symbols = this.symbolsStore;
        let symbols = this.symbols.filter((a) => a.count < 6);
        this.symbols = symbols;
      }

      //Filter all elements from 11 – 50 counts
      if (element == "to50") {
        this.symbols = this.symbolsStore;
        let symbols = this.symbols.filter((a) => a.count < 51 && a.count > 10);
        this.symbols = symbols;
      }

      //Filter all elements from 51 – 100 counts
      if (element == "to100") {
        this.symbols = this.symbolsStore;
        let symbols = this.symbols.filter((a) => a.count < 101 && a.count > 50);
        this.symbols = symbols;
      }

      //Filter all elements from 101 – 500 counts
      if (element == "to500") {
        this.symbols = this.symbolsStore;
        let symbols = this.symbols.filter(
          (a) => a.count < 501 && a.count > 100
        );
        this.symbols = symbols;
      }

      //Filter all symbols with more than 500 counts
      if (element == "500") {
        this.symbols = this.symbolsStore;
        let symbols = this.symbols.filter((a) => a.count > 499);
        this.symbols = symbols;
      }

      //Filter all symbols with duplicate names
      if (element == "duplicate") {
        this.symbols = this.symbolsStore;
        let symbols = [];
        for (let a = 0; a < this.symbols.length; a++) {
          let currentVal = this.symbols[a];
          for (let b = 0; b < this.symbols.length; b++) {
            let compareVal = this.symbols[b];

            if (compareVal.name == currentVal.name && a != b) {
              if (!symbols.includes(compareVal)) {
                symbols.push(compareVal);
              }
            }
          }
        }
        this.symbols = symbols;
        this.symbols.sort((a, b) => a.name.localeCompare(b.name));
      }

      this.symbols.length == 0
        ? (this.showNoResults = true)
        : (this.showNoResults = false);
      this.showBgLayer = false;
      this.showSortModal = false;
      this.showFilterModal = false;
    },
    closeSort() {
      this.showSortModal = false;
      this.showBgLayer = false;
    },
    closeFilter() {
      this.showFilterModal = false;
      this.showBgLayer = false;
    },
    showSort() {
      this.showBgLayer = true;
      this.showSortModal = true;
    },
    showFilter() {
      this.showFilterModal = true;
      this.showBgLayer = true;
    },
    showLightbox(symbol) {
      this.currentArtboardImg = symbol.path;
      this.showBgLayer = true;
      this.showArtboardInLightbox = true;
    },
    closeLightbox() {
      this.showBgLayer = false;
      this.showArtboardInLightbox = false;
      this.showSortModal = false;
      this.showFilterModal = false;
    },
    setComponentData(eventTarget) {
      let symbolName = eventTarget.getAttribute("name");
      let symbolId = eventTarget.getAttribute("id");
      let symbolOrigin = eventTarget.getAttribute("origin");
      let originalMasterId = eventTarget.getAttribute("originalmasterid");
      let symbolIds = eventTarget.getAttribute("symbolIds");
      let symbolCount = eventTarget.getAttribute("count");
      //Set component name
      this.componentName = symbolName;

      //Set data of current component
      this.currentComponent.id = symbolId;
      this.currentComponent.originalMasterId = originalMasterId;
      this.currentComponent.origin = symbolOrigin;
      this.currentComponent.name = symbolName;
      this.currentComponent.symbolIds = symbolIds;
      this.currentComponent.symbolCount = symbolCount;
    },
    async getComponentImg(eventTarget) {
      try {
        let symbolId = eventTarget.getAttribute("id");
        let originalFileName = eventTarget.getAttribute("originalfilename");
        let currentFileName = eventTarget.getAttribute("currentfilename");
        const port = process.env.PORT || 3060;
        const protocol = "http";
        const host = "localhost";
        const res = await axios.get(`${protocol}://${host}:${port}/component`, {
          params: {
            id: symbolId,
            origin: originalFileName,
            currentFile: currentFileName,
          },
        });

        if (res.headers["content-type"] == "image/png") {
          if (res.request.readyState == 4) {
            this.imgPath.img = res.request.responseURL;
            this.imgPath.status = true;
            this.showError = false;
          }
        }

        if (res.headers["content-type"] == "application/json; charset=utf-8") {
          this.rootFile = res.data.file;
          this.view.c = true;
          this.view.cp = false;
          this.showError = true;
          this.imgPath.status = false;
        }
      } catch (err) {
        console.error(err);
      }
    },
    async getComponentStats(element) {
      try {
        let symbolId = element.id;
        let symbolOrigin = element.origin;
        let originalMasterId = element.originalMasterId;
        let symbolIds = element.symbolIds;
        this.symbolCount = element.symbolCount;
        const port = process.env.PORT || 3060;
        const protocol = "http";
        const host = "localhost";
        const res = await axios.get(`${protocol}://${host}:${port}/stats/`, {
          params: {
            id: symbolId,
            origin: symbolOrigin,
            originalMasterId: originalMasterId,
            symbolIds: symbolIds,
          },
        });

        if (res.request.readyState == 4) {
          this.artboardsUsingComponent = res.data.artboardsUsing;
          this.totalArtboards = res.data.totalArtboards;
        }
      } catch (err) {
        console.error(err);
      }
    },
    async getComponentArtboards(element) {
      try {
        let originalMasterId = element.originalMasterId;
        let symbolIds = element.symbolIds.split(",");
        let artboards = [...this.artboardsData.artboards];
        const port = process.env.PORT || 3060;
        const protocol = "http";
        const host = "localhost";

        //Set artboard to an empty array, to erase previous data
        this.artboards = [];

        for (let artboard of artboards) {
          let symbolInstances = [...artboard.symbolInstances];
          let symbolInstancesCount = 0;
          //Check if there is at least one symbolinstance with the same id
          //as the originalMasterId of the current component
          let exists = (symbolInstanceId) =>
            symbolInstanceId == originalMasterId;
          let originalMasterIdExists = symbolInstances.some(exists);

          //If there is a symbolInstace with the same ID as originalMaster
          //Then get the count and add to symbolInstancesCount
          if (originalMasterIdExists == true) {
            let masterIdCount = symbolInstances.filter(
              (id) => id == originalMasterId
            );
            symbolInstancesCount += masterIdCount.length;
          }

          //Check if there are symbol ids of the current component
          //that equal to the symbolInstances of the artboard
          let symbolIdsExists = false;

          if (symbolIds != undefined && symbolIds[0] != "") {
            symbolIdsExists = symbolIds.some((symbolId) =>
              symbolInstances.includes(symbolId)
            );
          }
          if (symbolIdsExists == true) {
            for (let symbolId of symbolIds) {
              let symbolIdsCount = symbolInstances.filter(
                (id) => id == symbolId
              );
              symbolInstancesCount += symbolIdsCount.length;
            }
          }

          //If there is either one symbolId or one originalMasterId
          //that is equal to the list of the artboards symbolInstances
          //then send request to get artboard img
          if (symbolIdsExists == true || originalMasterIdExists == true) {
            const res = await axios.get(
              `${protocol}://${host}:${port}/component/artboards`,
              {
                params: {
                  do_objectID: artboard.do_objectID,
                },
              }
            );
            if (res.status == 200) {
              this.artboards.push({
                name: artboard.name,
                sketchFile: artboard.file.name,
                path: `${protocol}://${host}:${port}/component/artboards?do_objectID=${artboard.do_objectID}`,
                symbolInstancesCount: symbolInstancesCount,
              });
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
      this.totalArtboardsUsage = this.artboards.reduce((sum, count) => {
        return sum + count.symbolInstancesCount;
      }, 0);
    },
    selectComponent(event) {
      let element = event.currentTarget;
      this.componentsList = element.parentNode.childNodes;
      this.selectAllChecked == null
        ? this.selectAllChecked == null
        : (this.selectAllChecked.checked = false);
      this.selectAllSymbols = false;
      this.showSelectionAmount = this.selectAllSymbols;
      this.showDeleteAll = this.selectAllSymbols;
      //Set imgPath status to false
      this.imgPath.status = false;

      //Set data of current component
      this.setComponentData(element);

      //Show Mainview and close empty state
      this.showEmpty = false;
      this.showMain = true;
      this.view.c = true;
      this.view.cp = true;
      this.view.s = false;
      this.view.u = false;
      //Check if all views are closed if yes show component preview
      let bool = Object.values(this.view).every((v) => v == false);

      if (bool == true) {
        //Show componentpreview and hide preview error
        this.view.c = true;
        this.view.cp = true;
      }

      if (this.showError == true) {
        this.showError = false;
        this.view.c = true;
        this.view.cp = true;
      }

      //Remove selection from all list card elements
      this.componentsList.forEach((listcard) => {
        listcard.classList.remove("border-2", "border-lila-100");
      });

      //Add selection to current target
      element.classList.add("border-2", "border-lila-100");

      //Call functions
      //this.getComponentArtboards(this.currentComponent);
      //this.getComponentStats(element);
      this.getComponentImg(element);
    },
    changeView(event) {
      let element = event.currentTarget;
      let viewList = this.view;
      let currentComponent = this.currentComponent;
      //Set all views to false
      for (let v in viewList) {
        viewList[v] = false;
      }
      if (this.showError == true) {
        this.view.c = true;
        this.showError = true;
      } else {
        this.showError = false;
        //Set current view to true
        if (element.getAttribute("id") == "c") {
          this.view.c = true;
          this.view.cp = true;
        }

        if (element.getAttribute("id") == "s") {
          this.view.s = true;
          this.getComponentArtboards(currentComponent);
          this.getComponentStats(currentComponent);
        }

        if (element.getAttribute("id") == "u") {
          this.view.u = true;
          this.getComponentArtboards(currentComponent);
        }
      }
    },
  },
  computed: {
    degreeOfUse: function () {
      return (
        Math.round(
          (this.artboardsUsingComponent / this.totalArtboards) * 10000
        ) / 100
      );
    },
    filteredSymbols() {
      const {
        symbols,
        inputs: { search },
      } = this;

      if (!this.inputs.search) return symbols;

      return symbols.filter((symbol) => {
        return symbol.name.toLowerCase().includes(search.toLowerCase());
      });
    },
  },
  components: {
    Search,
    Loader,
    NavBar,
    ButtonOrganizer,
    ListCard,
    ButtonMenu,
    Divider,
    ComponentPreview,
  },
};
</script>
<style scoped>
aside {
  max-width: 440px;
  width: 100%;
  display: block;
  max-height: 100vh;
  height: 100vh;
  overflow: hidden;
}

.aside-wrapper {
  overflow: scroll;
  height: 100%;
  padding: 1.5rem;
  width: 100%;
}

.aside,
.main {
  max-height: calc(100vh - 60px);
  height: calc(100vh - 60px);
}

.component-view,
.main-wrapper {
  height: 100%;
}

.tag {
  height: 12px;
  width: 12px;
  border-radius: 100%;
}

.context-row {
  max-width: calc(96% / 2);
  width: 100%;
}
.main {
  overflow: hidden;
}

.list-card {
  cursor: pointer;
}

.main-wrapper {
  overflow: scroll;
}

.content-view {
  height: calc(100% - 118px);
}

.component-preview {
  max-height: 100%;
}

.artboards-view {
  gap: calc(4% / 3);
  width: 100%;
}

.artboards-view .artboard {
  max-width: calc(96% / 4);
  width: 100%;
}

.artboard-img {
  height: 144px;
  position: relative;
  width: 100%;
  background-color: theme("colors.night.400");
}

.artboard-img img {
  position: absolute;
  object-fit: contain;
  width: 100%;
  height: 100%;
}

.artboard-container {
  max-height: 100%;
  height: 100%;
  padding: 4rem;
  width: 100%;
  display: flex;
  justify-content: center;
}
.artboard-container img {
  height: 100%;
  object-fit: contain;
}
.code-tag {
  font-family: monospace;
  font-size: 16px;
  font-weight: bold;
  color: theme("colors.lila.100");
}

.artboard {
  cursor: pointer;
}

.btn-organizer {
  max-width: calc(50% - 0.5rem);
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

.fai {
  position: relative;
  left: 50%;
  transform: translateX(-50%);
}
.empty-state-illustration {
  position: relative;
  left: 50%;
  transform: translateX(-50%);
}

.delete-btn {
  border-radius: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 360ms ease-in-out;
  height: 48px;
  min-width: 48px;
}

.delete-btn:hover {
  background-color: theme("colors.greyolett.200");
}

.delete-btn img {
  padding: 1rem;
}

.delete-btn:active,
.delete-btn:focus {
  outline: 0;
  border: none;
}

/* The label-container */
.label-container {
  position: relative;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Hide the browser's default checkbox */
.label-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkbox-wrapper {
  position: relative;
  height: 28px;
  width: 28px;
}

/* Create a custom checkbox */
.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 28px;
  width: 28px;
}

.checkmark {
  border: 1px solid theme("colors.night.100");
}

/* Create the checkmark/indicator (hidden when not checked) */
.checkmark:after {
  content: "";
  display: none;
}

/* Show the checkmark when checked */
.label-container input:checked ~ .checkmark:after {
  display: block;
}

/* Style the checkmark/indicator */
.label-container .checkmark:after {
  content: "✓";
  font-weight: bold;
  font-family: theme("fontFamily.mono");
  color: theme("colors.lila.200");
  font-size: 20px;
}
</style>