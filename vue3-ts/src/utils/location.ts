import axios from "axios";
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { apiUrl } from "../config";
export const currentprovince = ref("");
export const currentcity = ref("");
export const loading = ref(false);
export const locationDenied = ref(false);

// 创建axios实例
const apiAxios = axios.create({
  baseURL: apiUrl, // 替换为您的后端地址
  timeout: 10000,
});

// 高德地图API实例（用于反向地理编码）
const gaodeAxios = axios.create({
  timeout: 5000,
});

// 主定位函数 - 支持多种定位方式
export const getCity = async () => {
  try {
    loading.value = true;

    // 方案1: 优先使用浏览器地理定位
    const geoLocationResult = await tryGeolocation();
    if (geoLocationResult.success) {
      currentprovince.value = geoLocationResult.province || "";
      currentcity.value = geoLocationResult.city || "";
      return;
    }

    // 方案2: 使用IP定位（通过后端）
    const ipLocationResult = await tryIPLocation();
    if (ipLocationResult.success) {
      currentprovince.value = ipLocationResult.province || "";
      currentcity.value = ipLocationResult.city || "";
      return;
    }

    // 所有方案都失败
    ElMessage.warning("无法获取当前位置信息");
  } catch (error) {
    console.error("定位失败:", error);
    ElMessage.error("获取位置失败");
  } finally {
    loading.value = false;
  }
};

// 方案1: 浏览器地理定位
async function tryGeolocation(): Promise<{
  success: boolean;
  province?: string;
  city?: string;
}> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ success: false });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const cityData = await fetchCityName(latitude, longitude);
          resolve({
            success: true,
            province: cityData.province,
            city: cityData.city,
          });
        } catch (error) {
          console.error("地理定位转换失败:", error);
          resolve({ success: false });
        }
      },
      (error) => {
        console.warn("浏览器定位失败:", error.message);
        resolve({ success: false });
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 300000, // 5分钟缓存
      }
    );
  });
}

// 方案2: IP定位（通过后端）
async function tryIPLocation(): Promise<{
  success: boolean;
  province?: string;
  city?: string;
}> {
  try {
    const response = await apiAxios.get("/location/ip-location");
    const data = response.data;

    if (data.status === "1" && data.data) {
      return {
        success: true,
        province: data.data.province,
        city: data.data.city,
      };
    }
    return { success: false };
  } catch (error) {
    console.error("IP定位失败:", error);
    return { success: false };
  }
}

// 反向地理编码：通过经纬度获取城市名
async function fetchCityName(
  lat: number,
  lng: number
): Promise<{ city?: string; province?: string }> {
  try {
    const response = await gaodeAxios.get(
      `https://restapi.amap.com/v3/geocode/regeo`,
      {
        params: {
          key: "ca334a8700bb63318e389db433153db2",
          location: `${lng},${lat}`,
          extensions: "base",
        },
      }
    );

    const data = response.data;
    if (data.status === "1") {
      const result = data.regeocode?.addressComponent || {};
      return {
        city: result.city || result.province, // 直辖市处理
        province: result.province,
      };
    }
  } catch (err) {
    console.error("反向地理编码失败:", err);
  }
  return {};
}

// 手动设置位置（备用）
export const setManualLocation = (province: string, city: string) => {
  currentprovince.value = province;
  currentcity.value = city;
};
