<template>
  <div>
    <NavBar />
    <main>
      <div class="main-wrapper">
        <section class="flex justify-between items-stretch mt-12">
          <DeadBoard
            :total-components="totalComponents"
            :dead-ratio-number="deadComponentsRatio"
            :dead-components="deadComponents"
            :used-components="totalComponents - deadComponents"
          />
          <SuggestBoard :suggestions="suggestions" />
        </section>
      </div>
    </main>
  </div>
</template>
<script>
import DeadBoard from "@/components/DeadBoard";
import SuggestBoard from "@/components/SuggestBoard";
import NavBar from "@/components/NavBar";
import axios from "axios";

export default {
  name: "Dashboard",
  components: {
    DeadBoard,
    SuggestBoard,
    NavBar,
  },
  data() {
    return {
      totalComponents: null,
      deadComponents: null,
      ratio: null,
      data: null,
      suggestions: [
        {
          suggestion: "Remove dead and less used components",
          status: true,
          link: "/components",
        },
        {
          suggestion: "Remove less used components",
          status: true,
        },
        {
          suggestion: "Remove duplicate components",
          status: true,
        },
        {
          suggestion: "Split sketch file",
          status: true,
        },
        {
          suggestion: "Reduce number of layers",
          status: true,
        },
      ],
    };
  },
  mounted() {
    const getData = async () => {
      try {
        const port = process.env.PORT || 3060;
        const protocol = "http";
        const host = "localhost";
        const res = await axios.get(`${protocol}://${host}:${port}/data`);
        this.data = res.data;
        let data = this.data;
        let count = 0;
        data.symbols.forEach((symbol) => {
          this.deadComponents = symbol.count == 0 ? (count += 1) : (count += 0);
          console.log(count);
        });
        this.totalComponents = data.symbols.length;
        this.ratio = this.deadComponents / this.totalComponents;
        console.log(JSON.parse(JSON.stringify(data.symbols)));
      } catch (err) {
        console.error(err);
      }
    };
    getData();

    /*
      this.data.symbols.forEach((symbol) => {
        let count = 0;
        this.deadComponents = symbol.count == 0 ? (count += 1) : (count += 0);
      });
      this.totalComponents = this.data.symbols.length;
      this.ratio = this.deadComponents / this.totalComponents;
      this.symbols = this.data.symbols;
    }
    this.deadComponents > 0 ? (this.suggestions[0].status = true) : false;*/
  },
  computed: {
    deadComponentsRatio: function () {
      return (
        Math.round((this.deadComponents / this.totalComponents) * 10000) / 100
      );
    },
  },
};
</script>
<style scoped>
#deadboard,
#suggestionboard {
  max-width: calc(50% - 1rem);
  width: 100%;
}

main {
  min-height: 100vh;
  padding: 0 24px 80px 24px;
}
@media all and (max-width: 1172px) {
  section {
    flex-wrap: wrap;
  }

  #deadboard,
  #suggestionboard {
    max-width: 100%;
  }

  #suggestionboard {
    margin-top: 1.5rem;
  }
}
</style>