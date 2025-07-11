const nodemailer = require("nodemailer");
// 随机产生六位验证码
function createSixNum() {
  let Num = "";
  for (var i = 0; i < 6; i++) {
    Num += Math.floor(Math.random() * 10);
  }
  return Num;
}
// 创建一个SMTP客户端对象
let transporter = nodemailer.createTransport({
  host: "smtp.qq.com", // 发送方邮箱 qq 通过lib/wel-konw
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: "2286223728@qq.com", // 发送方邮箱地址
    pass: "grdhlzyxnlaydhhi", // mtp 验证码 这个有了才可以发送邮件，可以qq邮箱去查看自己的码
  },
});
//发送邮件
function send(mail, code) {
  const mailContent = `
<p>您正在尝试重置Deep Sea账户的密码。为了确保是您本人操作，请使用以下验证码完成验证：</p>
<p><span style="font-weight: bold; color: #DC143C;">${code}</span></p>
<p>验证码有效期为五分钟，请尽快完成操作。</p>
<p>如果您并未发起此请求，请忽略本邮件，并检查您的账户安全。</p>
<p>祝您生活愉快！</p>
    `;
  // 邮件信息
  let mailobj = {
    from: "Deep Sea项目组<2286223728@qq.com>", // 发送方地址自定义
    to: mail, // 接收方地址
    subject: "Deep Sea重置密码验证", // 主题内容
    html: mailContent, // 使用html属性设置HTML内容
  };
  return new Promise((reslove, reject) => {
    // 发送邮件
    transporter.sendMail(mailobj, (err, data) => {
      if (err) {
        reject();
      } else {
        reslove();
      }
    });
  });
}
// 邮箱验证
function verifyEmail(mail, code) {
  const mailContent = `你的验证码是：${code}，请在五分钟内使用。`;
  // 邮箱信息
  let mailobj = {
    from: "Deep Sea项目组<2286223728@qq.com>", // 发送者，更改为与授权用户一致的邮箱地址
    to: mail, // 接收者
    subject: "Deep Sea邮箱验证", // 主题内容
    html: mailContent, // 使用html属性设置HTML内容
  };
  return new Promise((resolve, reject) => {
    // 发送邮件
    transporter.sendMail(mailobj, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}
module.exports = { createSixNum, send, verifyEmail };
