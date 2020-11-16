<template>
  <form
    id="fileuploader"
    class="items-center bg-night-200 text-cloud rounded p-6"
  >
    <div class="description">
      <h1 class="font-mono font-bold text-2xl w-full text-center">
        Upload your Sketch files
      </h1>
      <p class="w-full text-center font-light font-mono text-base my-1">
        Upload all Sketch files of your project.
      </p>
    </div>
    <div id="upload-field" class="w-full">
      <label
        class="w-full h-full transition duration-150 ease-in-out justify-center rounded flex flex-col items-center px-4 py-6 bg-night-200 tracking-wide font-light border border-dashed cursor-pointer hover:bg-night-300"
      >
        <div class="inner-field">
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
          <span class="">Upload Sketch Files</span>
        </div>
        <input type="file" class="hidden" />
      </label>
    </div>
    <ButtonPrimary btn-text="Upload"/>
  </form>
</template>
<script>
import ButtonPrimary from "@/components/ButtonPrimary";

export default {
  name: "FileUploader",
  data() {
    return {
      files: [],
    };
  },
  components: { ButtonPrimary },
};
</script>
<style scoped>
#fileuploader {
  max-width: 608px;
  width: 100%;
  min-height: 444px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

#upload-field {
  height: 176px;
}
</style>