<template>
  <router-view></router-view>
</template>

<script setup lang="ts" name="App">
import { onMounted, watch, onUnmounted } from "vue";
import { useUserStore } from "./store/userStore";
import { useThemeStore } from "./store/themeStore";
import { useI18n } from "vue-i18n";
import { getAllUsers, loadUserContents } from "./utils/publicuser";
const userStore = useUserStore();
const themeStore = useThemeStore();
const { locale } = useI18n();
onMounted(async () => {
  await userStore.loadUser();
  setTimeout(async () => {
    await getAllUsers();
    await loadUserContents();
  }, 1000);
  if (userStore.user?.uuid) {
    const savedLanguage = localStorage.getItem(
      `language-${userStore.user.uuid}`
    );
    locale.value = savedLanguage || "zh";
    if (!savedLanguage) {
      localStorage.setItem(`language-${userStore.user.uuid}`, "zh");
    }
  }
});
watch(
  () => userStore.user,
  (newUser, oldUser) => {
    if (newUser && oldUser && newUser.uuid !== oldUser.uuid) {
      getAllUsers();
      loadUserContents();
    }
    themeStore.loadTheme();
    if (newUser) {
      themeStore.setUser(newUser.uuid);
      if (themeStore.customTheme) {
        themeStore.applyCustomTheme(themeStore.customTheme);
      }
      const savedLanguage = localStorage.getItem(`language-${newUser.uuid}`);
      if (savedLanguage) {
        locale.value = savedLanguage;
      }
    }
  },
  { immediate: true }
);
</script>
<style>
#app {
  background-image: url("./assets/img/下载.svg");
  background-repeat: no-repeat;
  background-size: cover;
  height: 100vh;
}
body,
html {
  min-height: 100vh;
  margin: 0;
}
</style>
