<template>
  <div class="p-3 upload">
    <FileUploader />
  </div>
</template>
<script>
import FileUploader from "@/components/FileUploader";
export default {
  name: "Uploader",
  components: {
    FileUploader,
  },
};
</script>
<style scoped>
.upload {
  height: 100vh;
  width: 100vw;
  padding: 0;
}
</style>
