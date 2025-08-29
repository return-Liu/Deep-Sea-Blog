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
    pass: "vwwszxptjazpceha", // mtp 验证码 这个有了才可以发送邮件，可以qq邮箱去查看自己的码
  },
});

// 通用邮件模板函数
function createMailTemplate(title, content, footer = "") {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border: 1px solid #eaeaea; border-radius: 8px;">
      <div style="border-bottom: 1px solid #eee; padding-bottom: 15px; margin-bottom: 20px;">
        <h2 style="color: #333; margin: 0;">${title}</h2>
      </div>
      <div style="color: #555;">
        ${content}
      </div>
      ${
        footer
          ? `<div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; color: #888; font-size: 0.9em;">${footer}</div>`
          : ""
      }
      <div style="margin-top: 30px; text-align: center; color: #aaa; font-size: 0.8em;">
        <p>© ${new Date().getFullYear()} Deep Sea. All rights reserved.</p>
        <p style="color: #888; font-size: 0.9em;">
          📨 本邮件为系统自动发送，请勿直接回复。
        </p>
      </div>
    </div>
  `;
}

// 发送密码重置邮件
function send(mail, code) {
  const content = `
    <p>您正在尝试重置 Deep Sea 账户的密码。为了确保是您本人操作，请使用以下验证码完成验证：</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 24px; font-weight: bold; color: #DC143C; letter-spacing: 5px; padding: 15px 25px; border: 2px dashed #ddd; border-radius: 5px;">
        ${code}
      </span>
    </div>
    <p style="background-color: #f8f8f8; padding: 15px; border-left: 4px solid #DC143C;">
      <strong>注意：</strong>验证码有效期为 5 分钟，请尽快完成操作。
    </p>
    <p>如果您并未发起此请求，请忽略本邮件，并检查您的账户安全。</p>
  `;

  const mailContent = createMailTemplate(
    "Deep Sea 账户密码重置",
    content,
    "祝您生活愉快！<br>Deep Sea 团队"
  );

  let mailobj = {
    from: "3829626016@qq.com", // 移除尖括号
    to: mail,
    subject: "Deep Sea - 密码重置验证码",
    html: mailContent,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailobj, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

// 邮箱验证
function verifyEmail(mail, code) {
  const content = `
    <p>感谢您使用 Deep Sea 服务！您的验证码如下：</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 24px; font-weight: bold; color: #2196F3; letter-spacing: 5px; padding: 15px 25px; border: 2px dashed #ddd; border-radius: 5px;">
        ${code}
      </span>
    </div>
    <p style="background-color: #f8f8f8; padding: 15px; border-left: 4px solid #2196F3;">
      <strong>提示：</strong>验证码有效期为 5 分钟，请在有效期内使用。
    </p>
  `;

  const mailContent = createMailTemplate(
    "Deep Sea 邮箱验证",
    content,
    "Deep Sea 团队"
  );

  let mailobj = {
    from: "3829626016@qq.com",
    to: mail,
    subject: "Deep Sea - 邮箱验证验证码",
    html: mailContent,
  };

  return new Promise((resolve, reject) => {
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
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border: 1px solid #eaeaea; border-radius: 8px;">
      <div style="border-bottom: 1px solid #eee; padding-bottom: 15px; margin-bottom: 20px;">
        <h2 style="color: #333; margin: 0;">通知：留言墙需核实处理</h2>
      </div>
      <div style="color: #555;">
        <p>尊敬的用户，您好：</p>
        <p>我们收到用户反馈，您创建的留言墙包含以下内容：</p>
        <div style="background-color: #f8f8f8; padding: 15px; margin: 15px 0; border-left: 4px solid #FF9800;">
          <p>${content}</p>
        </div>
        <p>这条留言墙可能包含违规内容，已被用户举报，请您尽快核实并处理。</p>
        <p>若您未发布该留言墙内容，请忽略此邮件通知。</p>
      </div>
      <div style="margin-top: 30px; text-align: center; color: #aaa; font-size: 0.8em;">
        <p>© ${new Date().getFullYear()} Deep Sea. All rights reserved.</p>
        <p style="color: #888; font-size: 0.9em;">
          📨 本邮件为系统自动发送，请勿直接回复。
        </p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: "3829626016@qq.com",
    to: mail,
    subject: "【通知】您的留言墙需核实处理",
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
