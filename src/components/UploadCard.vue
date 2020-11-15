<template>
  <div id="upload-card" class="bg-night-300 rounded p-3">
    <div class="icon-wrapper">
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Sketch_Logo.svg/850px-Sketch_Logo.svg.png"
        alt="Sketch icon"
      />
    </div>
    <span class="file-name">Library.sketch</span>
    <button class="close-btn text-xl" type="button">×</button>
  </div>
</template>

<style>
#upload-card {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}

.icon-wrapper {
  height: 24px;
  width: 24px;
  overflow: hidden;
  position: relative;
  margin-right: 16px;
}

.icon-wrapper img {
  position: absolute;
  left: 0;
  top: 0;
  object-fit: cover;
  height: 100%;
  width: 100%;
}
.close-btn {
  margin-left: auto;
}

</style>>