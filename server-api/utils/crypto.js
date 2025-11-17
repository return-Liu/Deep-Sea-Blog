// const crypto = require("crypto");

// // 生成RSA密钥对
// function generateKeyPair() {
//   return new Promise((resolve, reject) => {
//     crypto.generateKeyPair(
//       "rsa",
//       {
//         modulusLength: 2048,
//         publicKeyEncoding: {
//           type: "spki",
//           format: "pem",
//         },
//         privateKeyEncoding: {
//           type: "pkcs8",
//           format: "pem",
//         },
//       },
//       (err, publicKey, privateKey) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve({ publicKey, privateKey });
//         }
//       }
//     );
//   });
// }

// // 解密密码函数
// function decryptPassword(encryptedPassword, privateKey) {
//   const decrypted = crypto.privateDecrypt(
//     {
//       key: privateKey,
//       padding: crypto.constants.RSA_PKCS1_PADDING,
//     },
//     Buffer.from(encryptedPassword, "base64")
//   );
//   return decrypted.toString("utf8");
// }
// module.exports = { generateKeyPair, decryptPassword };
