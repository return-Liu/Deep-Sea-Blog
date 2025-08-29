const OSS = require("ali-oss");

// OSS客户端配置
const client = new OSS({
  region: "oss-cn-beijing",
  accessKeyId: process.env.ALIBABA_CLOUD_ACCESS_KEY_ID,
  accessKeySecret: process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET,
  authorizationV4: true,
  bucket: process.env.OSS_BUCKET,
});

async function deleteFromOSS(ossFilePath) {
  try {
    await client.delete(ossFilePath);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

module.exports = {
  deleteFromOSS,
  client,
};
