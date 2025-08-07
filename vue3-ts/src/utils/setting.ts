import { ref } from "vue";
import { Plus, Camera, User, Lock, Check } from "@element-plus/icons-vue";
import languagesIcon from "../../components/icon/Languages.vue";
import { constellations } from "../utils/constellations";
import { areas } from "../utils/area";
import {
  HeartOutlined,
  SkinOutlined,
  GlobalOutlined,
  SwapOutlined,
} from "@ant-design/icons-vue";
// 记录初始信息
export const initialUserInfo = ref<{
  nickname: string;
  sex: string;
  birthday: string;
  introduce: string;
  avatar: string;
  constellation: string;
  nicknameColor: string;
  area: string;
  phone?: string;
}>({
  nickname: "",
  sex: "0",
  birthday: "",
  introduce: "",
  avatar: "",
  constellation: "",
  nicknameColor: "",
  area: "",
  phone: "",
});
export const tabs = [
  {
    id: "personals",
    icon: User,
  },
  {
    id: "securitys",
    icon: Lock,
  },
  {
    id: "likes",
    icon: HeartOutlined,
  },
  {
    id: "modes",
    icon: SkinOutlined,
  },
  {
    id: "languages",
    icon: languagesIcon,
  },
  {
    id: "toggleaccount",
    icon: SwapOutlined,
  },
];
export const constellationes = ref(
  constellations.map((item) => ({
    value: item.value,
    label: item.label,
  }))
);
export const areaes = ref(
  areas.map((item) => ({
    value: item.value,
    name: item.name,
  }))
);
