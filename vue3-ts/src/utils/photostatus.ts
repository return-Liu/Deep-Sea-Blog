import { ref } from "vue";
export const PhotoForm = ref<{
  id: string | null;
  title: string;
  description: string;
  userId: number | null;
  category: string | null;
  photoImages: string;
  date: Date;
  size?: number;
}>({
  id: null,
  title: "",
  userId: null,
  description: "",
  category: null,
  photoImages: "",
  date: new Date(),
  size: 0,
});
// 是否为编辑状态
export const isEdit = ref<boolean>(false);
export const photos = ref<
  {
    id: string;
    title: string;
    description: string;
    userId: number;
    category: string | null;
    photoImages: string;
    date: string;
    size: number;
    loaded: boolean;
    selected: boolean;
    position: {
      x: number;
      y: number;
    };
  }[]
>([]);
