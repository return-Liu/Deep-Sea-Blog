const axios = require("axios");
const cache = require("memory-cache");

const IP_API_SERVICES = {
  IPAPI: (ip) => `https://ipapi.co/${ip}/json/`,
  IPAPI_COM: (ip) =>
    `http://ip-api.com/json/${ip}?fields=status,message,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,offset,currency,isp,org,as,asname,reverse,mobile,proxy,hosting,query`,
  GEOLOCATION: (ip) => `https://geolocation-db.com/json/${ip}`,
};

async function getIPGeoLocation(ip) {
  if (
    ip === "::1" ||
    ip === "127.0.0.1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.")
  ) {
    return {
      ip,
      location: "本地网络",
      isLocal: true,
    };
  }

  const cached = cache.get(`ipgeo:${ip}`);
  if (cached) return cached;

  try {
    const response = await axios.get(IP_API_SERVICES.IPAPI_COM(ip), {
      timeout: 3000,
    });
    const data = response.data;

    if (data.status && data.status === "success") {
      const result = {
        ip,
        continent: data.continent,
        continentCode: data.continentCode,
        country: data.country,
        countryCode: data.countryCode,
        region: data.regionName,
        city: data.city,
        district: data.district,
        zip: data.zip,
        lat: data.lat,
        lon: data.lon,
        timezone: data.timezone,
        isp: data.isp,
        org: data.org,
        as: data.as,
        proxy: data.proxy,
        hosting: data.hosting,
        location: `${data.country || ""}${
          data.regionName ? `, ${data.regionName}` : ""
        }${data.city ? `, ${data.city}` : ""}`,
        raw: data,
      };

      cache.put(`ipgeo:${ip}`, result, 24 * 60 * 60 * 1000);
      return result;
    }
  } catch (error) {
    console.error("IP地理位置查询失败:", error.message);
  }

  const defaultResult = {
    ip,
    location: "未知位置",
    raw: null,
  };
  cache.put(`ipgeo:${ip}`, defaultResult, 60 * 60 * 1000);
  return defaultResult;
}

module.exports = { getIPGeoLocation };
