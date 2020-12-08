<template>
  <form
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
        <span class="mt-2 text-base leading-normal">Click to upload files</span>
        <input
          id="file-input"
          type="file"
          name="files"
          multiple
          class="hidden"
          accept=".sketch"
          v-on:change="fileValidation"
        />
      </label>
    </div>
    <div class="upload-progress mb-6">
      <h6 class="font-mono text-night-100">Uploaded file(s)</h6>
      <div class="upload-progress-item flex items-center my-6">
        <img src="@/assets/sketch-icon.png" alt="Sketch File icon" />
        <div class="bar-wrapper">
          <div class="bar-context flex justify-between mb-1">
            <div class="filename font-mono text-night-300 text-sm">
              Harbor.sketch
            </div>
            <div class="progress-percentage font-mono text-sm text-night-100">
              100%
            </div>
          </div>
          <div class="bar bg-green-400 rounded-xl"></div>
        </div>
        <button
          type="button"
          class="remove-file focus:outline-none leading-none bg-night-300 border text-cloud"
        >
          <div
            class="button-icon flex items-center leading-none justify-center"
          >
            ×
          </div>
        </button>
      </div>
    </div>
    <button-primary type="submit" text="Analyse Sketch Files"></button-primary>
  </form>
</template>

<script>
import ButtonPrimary from "@/components/ButtonPrimary";
export default {
  name: "FileUploader",
  components: {
    ButtonPrimary,
  },
  methods: {
    fileValidation() {
      let fileInput = document.getElementById("file-input");
      let files = fileInput.files;
      const reader = new FileReader();
      console.log(files);
      reader.onload = function () {
        console.log(reader.result);
      };
      reader.readAsText(files[0]);
    },
  },
};
</script>
<style scoped>
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

.remove-file {
  height: 24px;
  width: 24px;
  border-radius: 100%;
  margin-left: auto;
  position: relative;
}

.button-icon {
  height: 100%;
  width: 100%;
}
</style>