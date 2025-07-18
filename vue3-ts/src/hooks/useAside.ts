import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "../store/userStore";
import {
  HomeFilled,
  Share,
  ChatDotRound,
  FolderOpened,
  ChatSquare,
  VideoPause,
  Monitor,
  Right,
  Back,
  SetUp,
} from "@element-plus/icons-vue";
export default function useAside() {
  const route = useRoute();
  const showTitle = ref(true);
  const userStore = useUserStore();
  const user = computed(() => userStore.user);
  let userId = ref<number | null>(null);
  userId.value = user.value?.uuid || null;
  const isCollapsed = ref(false);
  async function fetchUserInfo() {
    if (userId.value) {
      const collapsedState = localStorage.getItem(
        `isCollapsed-${userId.value}`
      );
      if (collapsedState === "true") {
        isCollapsed.value = true;
      }
    }
  }

  const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value;
    localStorage.setItem(
      `isCollapsed-${userId.value}`,
      isCollapsed.value.toString()
    );
  };

  onMounted(() => {
    fetchUserInfo();
  });

  return {
    isCollapsed,
    toggleCollapse,
    HomeFilled,
    Share,
    ChatDotRound,
    FolderOpened,
    ChatSquare,
    VideoPause,
    Monitor,
    showTitle,
    Right,
    Back,
    route,
    SetUp,
    userId,
    user,
  };
}
