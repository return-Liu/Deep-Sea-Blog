import axios from "axios";
import { ref } from "vue";
import { apiUrl } from "../config";
import { ca } from "date-fns/locale";

export const currentprovince = ref("");
export const currentcity = ref("");
export const loading = ref(false);
export const locationDenied = ref(false);

// 创建axios实例
const apiAxios = axios.create({
  baseURL: apiUrl, // 替换为您的后端地址
  timeout: 10000,
});

// 获取详细地址
export async function getCity(): Promise<void> {
  try {
    loading.value = true;
    const response = await apiAxios.get("/location/ip-location");
    // console.log(response);

    const data = response.data.data;
    // console.log(data);
    currentprovince.value = data.province;
    currentcity.value = data.city;
    console.log(currentprovince, currentcity);
  } catch (error) {
    console.log(error);
    locationDenied.value = true;
  }
}
