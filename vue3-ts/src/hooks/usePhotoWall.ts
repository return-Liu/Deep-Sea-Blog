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
  // 合并后的照片表单数据
  const PhotoForm = ref<{
    id: string | null;
    title: string;
    description: string;
    userId: number | null;
    category: string | null;
    imageUrl: string;
    tags: string[];
    date: Date;
  }>({
    id: null,
    title: "",
    userId: null,
    description: "",
    category: null,
    imageUrl: "",
    tags: [],
    date: new Date(),
  });
  const photos = ref<
    {
      id: string;
      title: string;
      description: string;
      userId: number;
      category: string | null;
      imageUrl: string;
      tags: string[];
      date: string;
    }[]
  >([]);
  // 是否为编辑状态
  const isEdit = ref<boolean>(false);
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
  const filteredMessages = computed(() => {
    let filtered = photos.value;
    if (activeCategory.value !== "自然风光") {
      filtered = filtered.filter(
        (photo) => photo.category === activeCategory.value
      );
    }
    if (search.value) {
      const keyword = search.value.toLowerCase();
      filtered = filtered.filter(
        (photo) =>
          photo.title.toLowerCase().includes(keyword) ||
          photo.description.toLowerCase().includes(keyword) ||
          (photo.category && photo.category.toLowerCase().includes(keyword))
      );
    }
    return filtered;
  });
  const showAddMessage = () => {
    showMessageDrawer.value = true;
  };
  const handleCloseDrawer = () => {
    showMessageDrawer.value = false;
  };
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
