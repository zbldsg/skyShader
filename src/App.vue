<script setup>
import { RouterLink, RouterView } from "vue-router";
import HelloWorld from "./components/HelloWorld.vue";
</script>

<template>
  <RouterView />
</template>

<style lang="less">
#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: absolute;
}
* {
  margin: 0;
  padding: 0;
}
</style>
