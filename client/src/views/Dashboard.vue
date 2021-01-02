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
            :dead-ratio-calc="ratio"
          />
          <SuggestBoard />
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
    };
  },
  created() {
    axios
      .get("http://localhost:3060/dashboard")
      .then((res) => {
        this.totalComponents = res.data.count;
        this.deadComponents = res.data.deadCount;
        this.ratio = this.deadComponents / this.totalComponents;
        let data = localStorage.setItem("data", res.data);
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });
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