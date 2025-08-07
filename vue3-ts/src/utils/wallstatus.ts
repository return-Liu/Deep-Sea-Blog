import { ref, onMounted, watch, computed, defineProps } from "vue";
import { useUserStore } from "../store/userStore";
import { predefinedColors } from "../utils/wallbackground";
const userStore = useUserStore();

// 合并后的留言表单数据
export const messageForm = ref<{
  id: string | null;
  name: string;
  content: string;
  userId: number | null;
  category: string | null;
  likesCount: number;
  date: string;
  backgroundColor: string;
  nicknameColor?: string; // 可选属性，用于存储用户的昵称颜色
}>({
  id: null,
  name: userStore.user?.nickname || "",
  content: "",
  userId: null,
  category: null,
  likesCount: 0,
  date: "",
  backgroundColor: predefinedColors[0].color,
  nicknameColor: "",
});

// 是否为编辑模式
export const isEdit = ref<boolean>(false);
export const messages = ref<
  {
    id: string;
    content: string;
    name: string;
    backgroundColor: string;
    userId: number;
    category: string | null;
    likesCount: number;
    isLiked: boolean;
    date: string;
    nicknameColor?: string;
  }[]
>([]);
