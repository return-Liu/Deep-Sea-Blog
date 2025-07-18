import { ref, onMounted, watch, computed, defineProps } from "vue";
import { useRoute, useRouter } from "vue-router";
import { photoCategories } from "../utils/photo";
import { Plus, Edit, SuccessFilled } from "@element-plus/icons-vue";
import withMaintenanceMode from "../utils/withMaintenanceMode";

export default function usePhotoWall() {
  const props = defineProps({
    tab: {
      type: String,
      default: "photos",
    },
    category: {
      type: String,
      default: "全部",
    },
  });
  const tabs = [
    {
      id: "photos",
      title: "照片墙",
    },
  ];
  const showMessageDrawer = ref<boolean>(false);
  const showPhotoDrawer = ref(false);
  const route = useRoute();
  const router = useRouter();
  const activeCategory = ref<string>(route.query.category?.toString() || "");
  const activeTab = ref<string>(
    route.params.tab?.toString() || props.tab || "photos"
  );
  const search = ref("");
  const handlePhotoClick = (photo: any) => {
    const categoryId = photo.id;
    activeCategory.value = categoryId;
    router.replace({
      name: "photowall",
      params: { tab: "photos" },
      query: { category: categoryId },
    });
  };
  const handleSearch = () => {};
  const showAddMessage = withMaintenanceMode(() => {
    showMessageDrawer.value = true;
  });
  const handleCloseDrawer = () => {};
  return {
    tabs,
    activeTab,
    photoCategories,
    activeCategory,
    handlePhotoClick,
    search,
    handleSearch,
    showPhotoDrawer,
    showAddMessage,
    Plus,
    Edit,
    SuccessFilled,
    handleCloseDrawer,
    showMessageDrawer,
  };
}
