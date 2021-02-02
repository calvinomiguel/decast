<template>
  <div id="uploader">
    <Loader
      v-show="showLoader"
      :loading-text="loaderText"
    />
    <form
      @submit.prevent="sendFiles()"
      enctype="multipart/form-data"
      id="file-uploader"
      class="bg-cloud px-6 rounded-xl pt-12 pb-6 shadow-md"
    >
      <div class="text text-center">
        <h2 class="font-mono font-bold text-2xl text-night-300">
          Upload your sketch files
        </h2>
        <p class="font-mono text-base text-night-300">
          Only sketch files allowed
        </p>
      </div>
      <div class="upload-field flex w-full mt-10 mb-5">
        <label
          class="w-full items-center justify-center text-night-300 flex flex-col px-4 py-6 bg-cloud text-blue rounded tracking-wide uppercase border border-dashed cursor-pointer hover:bg-smokey"
        >
          <svg
            class="w-8 h-8"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path
              d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z"
            />
          </svg>
          <span
            class="mt-2 text-base leading-normal"
          >Click to upload files</span>
          <input
            @change="getFiles()"
            id="file-input"
            type="file"
            name="files"
            multiple
            class="hidden"
            accept=".sketch"
          >
        </label>
      </div>
      <div class="upload-progress mb-6">
        <h6 class="font-mono text-night-100">
          Uploaded file(s)
        </h6>
        <div class="fileslist">
          <div
            v-for="(file, index) in files"
            :key="index"
            class="py-2 px-3 border-greyolett-100 border rounded upload-progress-item flex items-center my-2"
          >
            <div class="bar-wrapper">
              <div class="bar-context flex justify-between mb-1">
                <div
                  class="filename font-mono text-night-400 font-medium text-md"
                >
                  {{ file }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button-primary
        type="submit"
        :class="btnClass"
        text="Upload Sketch Files"
      />
    </form>
  </div>
</template>

<script>
import Loader from "@/components/Loader";
import axios from "axios";
import ButtonPrimary from "@/components/ButtonPrimary";

export default {
  name: "FileUploader",
  data() {
    return {
      showLoader: false,
      files: [],
      sketchFiles: [],
      btnClass: "",
      symbols: [],
      artboards: [],
      data: null,
      artboardsData: null,
      loaderText:
        "Do not close the window. We are currently loading your sketch files. This may take a few minutes depending on the project size.",
    };
  },
  components: {
    ButtonPrimary,
    Loader,
  },
  methods: {
    async getData() {
      try {
        const port = process.env.PORT || 3060;
        const protocol = "http";
        const host = "localhost";
        const res = await axios.get(`${protocol}://${host}:${port}/data`);
        let data = res.data;
        this.data = data;
        this.sketchFiles = data.files;
        this.symbols = data.symbols;
      } catch (err) {
        console.error(err);
      }
    },
    async getArtboardData() {
      try {
        const port = process.env.PORT || 3060;
        const protocol = "http";
        const host = "localhost";
        const res = await axios.get(
          `${protocol}://${host}:${port}/artboards/data`
        );
        let data = res.data;
        this.file = data.files;
        this.artboardsData = res.data;
        this.artboards = data.artboards;
      } catch (err) {
        console.error(err);
      }
    },
    async getAllComponentImg() {
      try {
        const port = process.env.PORT || 3060;
        const protocol = "http";
        const host = "localhost";

        const res = await axios.get(
          `${protocol}://${host}:${port}/components/`
        );

        if (res.status == 200) {
          console.log(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    },
    async getAllArtboardsImg() {
      try {
        const port = process.env.PORT || 3060;
        const protocol = "http";
        const host = "localhost";
        let files = this.sketchFiles;
        for (let file of files) {
          let fileName = file.name;
          let filePath = file.path;
          let numbrOfIterations = files.length;
          let currentIteration = files.indexOf(file) + 1;
          let lastIteration = false;

          //Check if this is the last iteration
          if (currentIteration == numbrOfIterations) {
            lastIteration = true;
          }

          const res = await axios.get(
            `${protocol}://${host}:${port}/artboards`,
            {
              params: {
                fileName: fileName,
                filePath: filePath,
                lastFile: lastIteration,
              },
            }
          );

          if (res.status == 200) {
            console.log("Artboards of " + fileName + " exported.");
          }
        }

        //Redirect to dashboard after exporting all dashboard images
        this.$router.push("/dashboard");
      } catch (err) {
        console.error(err);
      }
    },
    getFiles() {
      let files = document.getElementById("file-input");
      files = files.files;
      if (this.files.length > 0) {
        this.files = [];
      }
      for (let i = 0; i < files.length; i++) {
        let file = files.item(i);
        this.files.push(file.name);
      }
    },
    async sendFiles() {
      let files = document.getElementById("file-input").files;
      if (files.length == 0) {
        alert("Please upload one or more sketch files to use decast.");
      } else {
        const form = document.getElementById("file-uploader");
        const pkg = new FormData(form);
        const port = process.env.PORT || 3060;
        const protocol = "http";
        const host = "localhost";
        this.showLoader = true;
        const res = await axios({
          method: "POST",
          baseURL: `${protocol}://${host}:${port}`,
          headers: { "content-type": "multipart/form-data" },
          url: "/uploads",
          data: pkg,
        });

        if (res.status == "200") {
          await this.getData();
          await this.getArtboardData();
          await this.getAllComponentImg();
          await this.getAllArtboardsImg();
        }

        /* for (let pair of pkg.entries()) {
          console.log(pair[1]);
        } */
      }
    },
  },
};
</script>
<style scoped>
#uploader {
  height: 100%;
}
#file-uploader {
  max-width: 608px;
  position: relative;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.upload-field {
  height: 174px;
}

.upload-field label {
  height: 100%;
}

.upload-progress-item {
  gap: 4%;
}
.upload-progress-item img {
  width: 28px;
}

.upload-progress-item .bar-wrapper {
  max-width: calc(92% - 52px);
  width: 100%;
}

.upload-progress-item .bar-wrapper .bar {
  width: 100%;
  height: 4px;
}

.button-icon {
  height: 24px;
  width: 24px;
  border-radius: 100%;
  margin-left: auto;
}
</style>