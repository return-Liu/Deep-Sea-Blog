const { client } = require("../utils/oss");

// 自定义请求头
const headers = {
  "x-oss-storage-class": "Standard",
  "x-oss-forbid-overwrite": "false",
  "x-oss-object-acl": "public-read",
};

// 上传文件到OSS
async function uploadToOSS(buffer, ossFileName) {
  try {
    const result = await client.put(ossFileName, buffer, { headers });
    return result;
  } catch (e) {
    console.error(`上传到OSS失败: ${ossFileName}`, e);
    throw e;
  }
}

// 从OSS删除文件
async function deleteFromOSS(ossFileName) {
  try {
    // 检查文件是否存在
    const exists = await client.head(ossFileName);
    if (!exists) {
      console.warn(`文件不存在: ${ossFileName}`);
      return;
    }

    await client.delete(ossFileName);
    console.log(`成功删除文件: ${ossFileName}`);
  } catch (e) {
    console.error(`从OSS删除文件失败: ${ossFileName}`, e);
    throw e;
  }
}

module.exports = { uploadToOSS, deleteFromOSS };
