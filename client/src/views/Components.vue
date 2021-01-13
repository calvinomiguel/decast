<template>
  <div>
    <NavBar />
    <div class="main-container flex">
      <aside class="aside bg-smokey">
        <div class="aside-wrapper">
          <Search />
          <div class="organizer-wrapper flex justify-between mt-3">
            <ButtonOrganizer
              class=""
              alt="Sort icon"
              fileName="sort-icon.png"
              btn-text="Sort"
            />
            <ButtonOrganizer alt="Filter icon" btn-text="Filter" />
          </div>
          <CheckBox label="Select all" class="ml-4 mt-8" />
          <div class="components-list mt-4">
            <ListCard
              v-on:click.native="selectComponent"
              v-for="(symbol, index) in symbols"
              :origin="symbol.originFile"
              :key="index"
              :name="symbol.name"
              :count="symbol.count"
              :id="symbol.do_objectID"
              :originalMasterId="symbol.originalMasterId"
              :symbolIds="symbol.symbolIds"
              class="mb-2 border-lila-200"
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
                :imgPath="
                  imgPath.status == false
                    ? require('@/assets/img/Ajax-Preloader.gif')
                    : imgPath.img
                "
              />
            </div>
            <div class="s-view-wrapper pb-6">
              <ComponentPreview
                class="p-view"
                v-show="view.p"
                :imgPath="require('@/assets/img/Ajax-Preloader.gif')"
              />
              <div class="s-view" v-show="view.s">
                <h2 class="font-mono font-bold text-2xl text-night-300">
                  Scope of use
                </h2>
                <div class="chart-container flex justify-center py-24">
                  <pie-chart
                    id="pie-chart"
                    width="240px"
                    height="240px"
                    :data="chartData"
                    :colors="colors"
                    :legend="false"
                  ></pie-chart>
                </div>
                <div class="chart-context">
                  <div class="context-table justify-between flex">
                    <div class="context-row">
                      <div class="row-wrapper flex justify-between">
                        <div class="row-text">
                          <h4 class="text-night-300 font-mono">
                            Total artboards
                          </h4>
                          <p class="font-bold text-night-300 mt-2 font-mono">
                            {{ totalArtboards }}
                          </p>
                        </div>
                        <div class="tag bg-night-400"></div>
                      </div>
                      <Divider class="mt-2 w-full" />
                    </div>
                    <div class="context-row">
                      <div class="row-wrapper flex justify-between">
                        <div class="row-text">
                          <h4 class="text-night-300 font-mono">
                            Artboards using component
                          </h4>
                          <p class="font-bold text-night-300 mt-2 font-mono">
                            {{ artboardsUsingComponent }}
                          </p>
                        </div>
                        <div class="tag bg-lila-100"></div>
                      </div>
                      <Divider class="mt-2 w-full" />
                    </div>
                  </div>
                  <h3 class="font-mono text-xl text-right text-night-300 mt-4">
                    Degree of use
                  </h3>
                  <p
                    class="font-mono text-night-300 text-xl text-right font-bold"
                  >
                    {{ degreeOfUse }}%
                  </p>
                </div>
                <h2 class="font-mono font-bold text-2xl mt-24 text-night-300">
                  Artboards
                </h2>
                <div class="artboard-table mt-10">
                  <div class="artboard-row mb-3">
                    <div class="flex justify-between">
                      <div class="artboard-name font-mono text-night-300">
                        Homepage
                      </div>
                      <div
                        class="usage-count text-night-300 font-mono text-right font-bold"
                      >
                        600
                      </div>
                    </div>
                    <Divider class="mt-3" />
                  </div>
                  <div class="artboard-row mb-3">
                    <div class="flex justify-between">
                      <div class="artboard-name font-mono text-night-300">
                        Homepage
                      </div>
                      <div
                        class="usage-count text-night-300 font-mono text-right font-bold"
                      >
                        600
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
                        600
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="u-view" v-show="view.u">
              <div class="artboards-view inline-flex flex-wrap">
                <div
                  class="artboard rounded-lg hover:bg-smokey p-3 transition-all duration-300 mb-3"
                >
                  <div
                    class="artboard-img border border-night-100 overflow-hidden rounded"
                  >
                    <img
                      src="@/assets/img/artboards/b179df4f-8219-420f-bedb-29071672c9f0.png"
                      alt=""
                    />
                  </div>
                  <h3 class="font-mono text-night-300 mt-2 font-bold">
                    Workflow builder
                  </h3>
                </div>
                <div
                  class="artboard rounded-lg hover:bg-smokey p-3 transition-all duration-300 mb-3"
                >
                  <div
                    class="artboard-img border border-night-100 overflow-hidden rounded"
                  >
                    <img
                      src="@/assets/img/artboards/b179df4f-8219-420f-bedb-29071672c9f0.png"
                      alt=""
                    />
                  </div>
                  <h3 class="font-mono text-night-300 mt-2 font-bold">
                    Workflow builder
                  </h3>
                </div>
                <div
                  class="artboard rounded-lg hover:bg-smokey p-3 transition-all duration-300 mb-3"
                >
                  <div
                    class="artboard-img border border-night-100 overflow-hidden rounded"
                  >
                    <img
                      src="@/assets/img/artboards/b179df4f-8219-420f-bedb-29071672c9f0.png"
                      alt=""
                    />
                  </div>
                  <h3 class="font-mono text-night-300 mt-2 font-bold">
                    Workflow builder
                  </h3>
                </div>
                <div
                  class="artboard rounded-lg hover:bg-smokey p-3 transition-all duration-300 mb-3"
                >
                  <div
                    class="artboard-img border border-night-100 overflow-hidden rounded"
                  >
                    <img
                      src="@/assets/img/artboards/b179df4f-8219-420f-bedb-29071672c9f0.png"
                      alt=""
                    />
                  </div>
                  <h3 class="font-mono text-night-300 mt-2 font-bold">
                    Workflow builder
                  </h3>
                </div>
                <div
                  class="artboard rounded-lg hover:bg-smokey p-3 transition-all duration-300 mb-3"
                >
                  <div
                    class="artboard-img border border-night-100 overflow-hidden rounded"
                  >
                    <img
                      src="@/assets/img/artboards/b179df4f-8219-420f-bedb-29071672c9f0.png"
                      alt=""
                    />
                  </div>
                  <h3 class="font-mono text-night-300 mt-2 font-bold">
                    Workflow builder
                  </h3>
                </div>
                <div
                  class="artboard rounded-lg hover:bg-smokey p-3 transition-all duration-300 mb-3"
                >
                  <div
                    class="artboard-img border border-night-100 overflow-hidden rounded"
                  >
                    <img
                      src="@/assets/img/artboards/b179df4f-8219-420f-bedb-29071672c9f0.png"
                      alt=""
                    />
                  </div>
                  <h3 class="font-mono text-night-300 mt-2 font-bold">
                    Workflow builder
                  </h3>
                </div>
                <div
                  class="artboard rounded-lg hover:bg-smokey p-3 transition-all duration-300 mb-3"
                >
                  <div
                    class="artboard-img border border-night-100 overflow-hidden rounded"
                  >
                    <img
                      src="@/assets/img/artboards/b179df4f-8219-420f-bedb-29071672c9f0.png"
                      alt=""
                    />
                  </div>
                  <h3 class="font-mono text-night-300 mt-2 font-bold">
                    Workflow builder
                  </h3>
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
import CheckBox from "@/components/CheckBox";
import ListCard from "@/components/ListCard";
import ButtonMenu from "@/components/ButtonMenu";
import Divider from "@/components/Divider";
import ComponentPreview from "@/components/ComponentPreview";
import axios from "axios";
export default {
  name: "Components",
  data() {
    return {
      showMain: false,
      showError: false,
      rootFile: null,
      showEmpty: true,
      loaderStatus: false,
      view: {
        c: false,
        s: false,
        p: false,
        u: false,
        cp: true,
      },
      imgPath: {
        status: false,
        img: null,
      },
      componentName: null,
      componentsList: null,
      totalArtboards: 0,
      artboardsUsingComponent: 0,
      colors: ["#856de7", "#23272a"],
      chartData: {
        "Total artboards": 999,
        "Artboards using component": 1440,
      },
      currentComponent: {
        name: null,
        id: null,
        originalMasterId: null,
        symbolIds: null,
        origin: null,
      },
      data: null,
      symbols: [],
    };
  },
  props: {
    viewTitle: {
      type: String,
      default: "Component",
    },
  },
  mounted() {
    const getData = async () => {
      try {
        const port = process.env.PORT || 3060;
        const protocol = "http";
        const host = "localhost";
        const res = await axios.get(`${protocol}://${host}:${port}/data`);
        let data = res.data;
        let symbols = data.symbols;

        symbols.forEach((symbol) => {
          this.symbols.push(symbol);
        });
      } catch (err) {
        console.error(err);
      }
    };
    getData();
  },
  methods: {
    changeView(event) {
      let element = event.currentTarget;
      let viewList = this.view;

      //Set all views to false
      for (let v in viewList) {
        viewList[v] = false;
        console.log(viewList[v]);
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
          if (this.loaderStatus == true) {
            this.view.s = true;
            this.view.p = false;
          } else {
            this.view.p = true;
            this.view.s = false;
          }
        }

        if (element.getAttribute("id") == "u") {
          this.view.u = true;
        }
      }
    },
    async getComponentImg(eventTarget) {
      try {
        let symbolId = eventTarget.getAttribute("id");
        let symbolOrigin = eventTarget.getAttribute("origin");
        const port = process.env.PORT || 3060;
        const protocol = "http";
        const host = "localhost";
        const res = await axios.get(`${protocol}://${host}:${port}/component`, {
          params: {
            id: symbolId,
            origin: symbolOrigin,
          },
        });

        if (res.headers["content-type"] == "image/png") {
          if (res.request.readyState == 4) {
            this.imgPath.img = res.request.responseURL;
            this.imgPath.status = true;
            this.showError = false;
            console.log(res);
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
    async getComponentStats(eventTarget) {
      try {
        let symbolId = eventTarget.getAttribute("id");
        let symbolOrigin = eventTarget.getAttribute("origin");
        let originalMasterId = eventTarget.getAttribute("originalmasterid");
        let symbolIds = eventTarget.getAttribute("symbolIds");
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
          //Hide loader and show stats table
          this.loaderStatus = true;
        }
      } catch (err) {
        console.error(err);
      }
    },
    setComponentData(eventTarget) {
      let symbolName = eventTarget.getAttribute("name");
      let symbolId = eventTarget.getAttribute("id");
      let symbolOrigin = eventTarget.getAttribute("origin");
      let originalMasterId = eventTarget.getAttribute("originalmasterid");
      let symbolIds = eventTarget.getAttribute("symbolIds");

      //Set component name
      this.componentName = symbolName;

      //Set data of current component
      this.currentComponent.id = symbolId;
      this.currentComponent.originalMasterId = originalMasterId;
      this.currentComponent.origin = symbolOrigin;
      this.currentComponent.name = symbolName;
      this.currentComponent.symbolIds = symbolIds;
    },
    selectComponent(event) {
      let element = event.currentTarget;
      this.componentsList = element.parentNode.childNodes;

      //Set imgPath status to false
      this.imgPath.status = false;

      //Set data of current component
      this.setComponentData(element);

      //Show Mainview and close empty state
      this.showEmpty = false;
      this.showMain = true;

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
      this.getComponentStats(element);
      this.getComponentImg(element);
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
  },
  components: {
    Search,
    NavBar,
    ButtonOrganizer,
    CheckBox,
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
}
.artboards-view .artboard {
  max-width: calc(96% / 4);
  width: 100%;
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
</style>