import axiosConfig from "../utils/request";
import { ref } from "vue";
import { ElMessage } from "element-plus";
export const currentprovince = ref("");
export const currentCity = ref("");
export const loading = ref(false);
export const getCity = async () => {
  try {
    loading.value = true;
    const response = await axiosConfig.get("/location/ip-location");
    console.log(response);

    currentprovince.value = response.data.message.province;
    currentCity.value = response.data.message.city;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "未知错误";
    ElMessage.error(errorMessage);
  }
};
