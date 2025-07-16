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
    user: "3829626016@qq.com", // 发送方邮箱地址
    pass: "ibcyzpkxqkaxcgdg", // mtp 验证码 这个有了才可以发送邮件，可以qq邮箱去查看自己的码
  },
});
//发送邮件
function send(mail, code) {
  const mailContent = `
<p>您正在尝试重置Deep Sea账户的密码。为了确保是你本人操作，请使用以下验证码完成验证：</p>
<p><span style="font-weight: bold; color: #DC143C;">${code}</span></p>
<p>验证码有效期为五分钟，请尽快完成操作。</p>
<p>如果你并未发起此请求，请忽略本邮件，并检查您的账户安全。</p>
<p>祝你生活愉快！</p>
    `;
  // 邮件信息
  let mailobj = {
    from: "<3829626016@qq.com>", // 发送方地址自定义
    to: mail, // 接收方地址
    subject: "来自Deep Sea重置密码验证", // 主题内容
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
    from: "<3829626016@qq.com>", // 发送者，更改为与授权用户一致的邮箱地址
    to: mail, // 接收者
    subject: "来自Deep Sea邮箱验证", // 主题内容
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
// 通知留言墙墙主删除留言墙
function notifyWallOwner(mail, content) {
  const mailContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
      <p>你好：</p>
      <p>我们收到反馈，你创建的留言墙包含以下内容：</p>
      <blockquote style="padding: 10px 20px; background-color: #f9f9f9; border-left: 4px solid #ccc; font-style: italic; color: #555;">
        ${content}
      </blockquote>
      <p>这条留言墙可能包含违规内容，已被用户举报，请你尽快核实并处理。</p>
      <p>如果你没有发布这条留言墙，可能是其他用户误操作或系统异常，你不需要做任何操作。</p>
      <p>如有疑问或需要沟通，欢迎随时联系：</p>
      <p><strong>联系邮箱：</strong> <a href="mailto:3829626016@qq.com" style="color: #007BFF; text-decoration: none;">3829626016@qq.com</a></p>
      <p>感谢你的理解和配合！</p>
      <br/>
<p style="color: #888; font-size: 0.9em;">
  📨 本邮件为系统自动发送，请勿直接回复。
  <a href="mailto:3829626016@qq.com" style="color: #007BFF; text-decoration: underline;">如有问题可点此联系我们</a>。
</p>
    </div>
  `;

  const mailOptions = {
    from: "<3829626016@qq.com>",
    to: mail,
    subject: "【通知】你的留言墙需核实处理",
    html: mailContent,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, data) => {
      if (err) {
        console.error("邮件发送失败:", err);
        reject(err);
      } else {
        console.log("邮件发送成功:", data.response);
        resolve(data);
      }
    });
  });
}
module.exports = { createSixNum, send, verifyEmail, notifyWallOwner };
