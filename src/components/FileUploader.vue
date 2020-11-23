<template>
  <div id="file-uploader" class="bg-cloud px-6 rounded-xl pt-12 shadow-md">
    <div class="text text-center">
      <h2 class="font-mono font-bold text-2xl text-night-300">
        Upload your sketch files
      </h2>
      <p class="font-mono text-base text-night-300">
        Only sketch files allowed
      </p>
    </div>
    <div class="upload-field flex w-full mt-10 mb-10">
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
        <span class="mt-2 text-base leading-normal">Select a file</span>
        <input type="file" class="hidden" />
      </label>
    </div>
    <button-primary text="Analyse Sketch Files"></button-primary>
  </div>
</template>

<script>
import ButtonPrimary from "@/components/ButtonPrimary";
export default {
  name: "FileUploader",
  components: {
    ButtonPrimary,
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
  height: 444px;
}

.upload-field {
  height: 174px;
}

.upload-field label {
  height: 100%;
}
</style>