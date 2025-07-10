const fs = require("fs");
const path = require("path");
const { generateKeyPairSync } = require("crypto");

const keyPair = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
  },
});
const keysDir = path.join(__dirname, "keys");
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir);
}
// 写入私钥
fs.writeFileSync(path.join(__dirname, "keys/private.pem"), keyPair.privateKey);

// 写入公钥
fs.writeFileSync(path.join(__dirname, "keys/public.pem"), keyPair.publicKey);

console.log("✅ RSA 密钥已生成！");
