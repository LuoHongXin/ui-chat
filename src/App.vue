<script setup>
import ChatLayout from "./components/ChatLayout.vue";
import { useAuthStore } from "./stores/auth";
import { redirectToAuth } from "./utils/auth";
import { onMounted, ref } from "vue";

const isTokenLoaded = ref(false);

const authStore = useAuthStore();

onMounted(async () => {
  if (import.meta.env.DEV) {
    isTokenLoaded.value = true;
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  if (code) {
    authStore.setCode(code);
  } else {
    return redirectToAuth();
  }
  const token = await authStore.getToken();
  if (token) {
    await authStore.getUserInfo();
    isTokenLoaded.value = true;
    console.log("Token:", authStore.token);
    console.log("User Info:", authStore.userInfo);
  }
});
</script>

<template>
  <ChatLayout v-if="isTokenLoaded" />
</template>

<style>
#app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100vh;
}
</style>
