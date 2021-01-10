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
              class="mb-2 border-lila-200"
            />
          </div>
        </div>
      </aside>
      <main class="main bg-cloud w-full">
        <div
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
        <div class="main-wrapper px-5 py-6">
          <div class="main-head">
            <h1 class="font-mono font-bold text-4xl mb-3">
              {{ componentName }}
            </h1>
            <ButtonMenu
              @click.native="changeView"
              id="c-view"
              class="mr-2"
              text="Component"
            />
            <ButtonMenu
              @click.native="changeView"
              id="s-view"
              class="mr-2"
              text="Stats"
            />
            <ButtonMenu
              @click.native="changeView"
              id="u-view"
              text="Usage context"
            />
            <Divider class="mt-6" />
          </div>
          <div class="content-view mt-6 pb-6">
            <div
              class="c-view bg-smokey h-full w-full flex items-center justify-center px-4 py-4 rounded"
            >
              <img src="../../../api/exports/primary-button@2x.jpg" alt="" />
            </div>
            <div class="s-view pb-6">
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
            <div class="u-view">
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
import axios from "axios";
export default {
  name: "Components",
  data() {
    return {
      components: undefined,
      totalArtboards: 1440,
      artboardsUsingComponent: 999,
      colors: ["#856de7", "#23272a"],
      chartData: {
        "Total artboards": 999,
        "Artboards using component": 1440,
      },
      currentComponent: {
        name: null,
        id: null,
      },
      data: null,
      symbols: [],
      views: ["s-view", "c-view", "u-view"],
    };
  },
  props: {
    componentName: {
      type: String,
      default: "btn-primary",
    },
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
        console.log(data);
      } catch (err) {
        console.error(err);
      }
    };
    getData();
  },
  methods: {
    changeView(event) {
      this.views.forEach((view) => {
        let element = document.querySelector("." + view);
        element.style.display = "none";
        if (view == event.target.id) {
          view == "c-view"
            ? (element.style.display = "flex")
            : (element.style.display = "block");
        }
      });
    },
    selectComponent(event) {
      let emptyState = document.querySelector(".empty-state");
      let mainView = document.querySelector(".main-wrapper");
      let element = event.currentTarget;
      let listCardList = element.parentNode.childNodes;
      let symbolId = element.getAttribute("id");
      let symbolOrigin = element.getAttribute("origin");

      //Show Mainview and close empty state
      emptyState.style.display = "none";
      mainView.style.display = "block";

      //Remove selection from all list card elements
      listCardList.forEach((listcard) => {
        listcard.classList.remove("border-2", "border-lila-100");
        listcard.classList.add("border-night-100", "border");
      });

      //Add selection to current target
      element.classList.remove("border-night-100", "border");
      element.classList.add("border-2", "border-lila-100");

      const getComponentData = async () => {
        try {
          const port = process.env.PORT || 3060;
          const protocol = "http";
          const host = "localhost";
          const res = await axios.get(
            `${protocol}://${host}:${port}/component`,
            {
              params: {
                id: symbolId,
                origin: symbolOrigin,
              },
            }
          );
          let data = res.data;
          console.log(data);
        } catch (err) {
          console.error(err);
        }
      };
      getComponentData();
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

.artboards-view {
  gap: calc(4% / 3);
}
.artboards-view .artboard {
  max-width: calc(96% / 4);
  width: 100%;
}

.artboard {
  cursor: pointer;
}
.main-wrapper,
.s-view,
.u-view {
  display: none;
}
.btn-organizer {
  max-width: calc(50% - 0.5rem);
}
</style>