<template>
  <div class="main-container flex">
    <aside class="aside bg-smokey">
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
      <Checkbox label="Select all" class="ml-4 mt-8" />
      <div class="components-list mt-4">
        <ListCard />
      </div>
    </aside>
    <main class="main bg-cloud w-full">
      <div class="main-wrapper px-5 py-6">
        <div class="main-head">
          <h1 class="font-mono font-bold text-4xl mb-3">{{ componentName }}</h1>
          <ButtonMenu class="mr-2" text="Component" />
          <ButtonMenu class="mr-2" text="Stats" />
          <ButtonMenu text="Usage context" />
          <Divider class="mt-6" />
        </div>
        <div class="content-view mt-6 pb-6">
          <div
            class="component-view bg-smokey w-full flex items-center justify-center px-4 py-4 rounded"
          >
            <img
              src="https://semble.org/wp-content/uploads/2020/04/273944_5895ce6dcba9841eabab6068.png"
              alt=""
            />
          </div>
          <div class="stats-view">
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
                      <h4 class="text-night-300 font-mono">Total artboards</h4>
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
              <p class="font-mono text-night-300 text-xl text-right font-bold">
                {{ degreeOfUse }}%
              </p>
            </div>
            <h2 class="font-mono font-bold text-2xl mt-24 text-night-300">
              Artboards
            </h2>
          </div>
          <div class="context-view"></div>
        </div>
      </div>
    </main>
  </div>
</template>
<script>
import Search from "@/components/Search";
import ButtonOrganizer from "@/components/ButtonOrganizer";
import Checkbox from "@/components/Checkbox";
import ListCard from "@/components/ListCard";
import ButtonMenu from "@/components/ButtonMenu";
import Divider from "@/components/Divider";
export default {
  name: "Components",
  data() {
    return {
      totalArtboards: 1440,
      artboardsUsingComponent: 999,
      colors: ["#856de7", "#23272a"],
      chartData: {
        "Total artboards": 999,
        "Artboards using component": 1440,
      },
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
    ButtonOrganizer,
    Checkbox,
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
  padding: 1.5rem;
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

.main-wrapper {
  overflow: scroll;
}

.content-view {
  height: calc(100% - 118px);
}

.component-view {
  display: none;
}
.btn-organizer {
  max-width: calc(50% - 0.5rem);
}
</style>