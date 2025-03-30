<script setup>
import { ref } from "vue";
import { THEME_CONFIG } from "../config";

const currentTheme = ref(THEME_CONFIG.defaultTheme);

const toggleTheme = () => {
  console.log("切换主题");
  currentTheme.value = currentTheme.value === "dark" ? "light" : "dark";
  document.documentElement.className = `${currentTheme.value}-theme`;
};
</script>

<template>
  <el-button
    :icon="currentTheme === 'dark' ? 'Sunny' : 'Moon'"
    circle
    @click="toggleTheme"
    class="theme-switch"
  />
</template>

<style scoped>
.theme-switch {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}
</style>