const nodemailer = require("nodemailer");

// 随机产生六位验证码
function createSixNum() {
  let Num = "";
  for (let i = 0; i < 6; i++) {
    Num += Math.floor(Math.random() * 10);
  }
  return Num;
}

// 创建一个SMTP客户端对象
let transporter = nodemailer.createTransport({
  host: "smtp.qq.com",
  port: 465,
  secure: true,
  auth: {
    user: "3829626016@qq.com",
    pass: "vwwszxptjazpceha",
  },
});

// 通用邮件模板函数
function createMailTemplate(title, content, footer = "") {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
      <!-- 邮件头部 -->
      <div style="text-align: center; border-bottom: 2px solid #f0f0f0; padding-bottom: 20px; margin-bottom: 25px;">
        <h1 style="color: #1890ff; margin: 0 0 10px 0; font-size: 24px;">Deep Sea</h1>
        <h2 style="color: #333; margin: 0; font-size: 18px; font-weight: 500;">${title}</h2>
      </div>
      
      <!-- 邮件内容 -->
      <div style="color: #555; font-size: 14px;">
        ${content}
      </div>
      
      <!-- 页脚 -->
      ${
        footer
          ? `<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #f0f0f0; color: #666; font-size: 13px; line-height: 1.5;">${footer}</div>`
          : ""
      }
      
      <!-- 版权信息 -->
      <div style="margin-top: 30px; text-align: center; color: #999; font-size: 12px; line-height: 1.4;">
        <p>© ${new Date().getFullYear()} Deep Sea Platform. All rights reserved.</p>
        <p style="margin: 5px 0;">
          <span style="color: #888;">📨 系统自动发送，请勿直接回复</span>
        </p>
        <p style="margin: 5px 0; color: #888;">
          如有疑问，请联系客服邮箱：<a href="mailto:3829626016@qq.com" style="color: #1890ff; text-decoration: none;">3829626016@qq.com</a>
        </p>
      </div>
    </div>
  `;
}

function sendPasswordReset(mail, code) {
  const content = `
    <p>尊敬的用户，您好！</p>
    <p>您正在重置 Deep Sea 账户密码，验证码为：</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 3px; border-radius: 8px;">
        <span style="display: inline-block; font-size: 28px; font-weight: bold; color: #fff; letter-spacing: 8px; padding: 20px 40px; background: #fff; color: #333; border-radius: 6px;">
          ${code}
        </span>
      </div>
    </div>
    
    <div style="background-color: #f6ffed; border: 1px solid #b7eb8f; border-radius: 6px; padding: 16px; margin: 20px 0;">
      <div style="display: flex; align-items: flex-start;">
        <span style="color: #52c41a; margin-right: 8px;">🔒</span>
        <div>
          <strong style="color: #389e0d;">安全提醒：</strong>
          <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #555;">
            <li>验证码有效期为 <strong>5 分钟</strong></li>
            <li>请勿泄露给他人</li>
            <li>如非本人操作，请忽略此邮件</li>
          </ul>
        </div>
      </div>
    </div>
    
    <p style="color: #888; font-size: 13px;">如非本人操作，请忽略此邮件，您的账户将保持安全。</p>
  `;

  const mailContent = createMailTemplate(
    "密码重置验证码",
    content,
    "感谢您使用 Deep Sea 服务！"
  );

  let mailOptions = {
    from: '"Deep Sea 官方" <3829626016@qq.com>',
    to: mail,
    subject: "【Deep Sea】密码重置验证码",
    html: mailContent,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

// 邮箱验证 - 注册场景
function verifyEmailForRegister(mail, code) {
  const content = `
    <p>尊敬的用户，您好！</p>
    <p>欢迎注册 Deep Sea 服务！您的验证码为：</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <div style="display: inline-block; background: linear-gradient(135deg, #36D1DC 0%, #5B86E5 100%); padding: 3px; border-radius: 8px;">
        <span style="display: inline-block; font-size: 28px; font-weight: bold; color: #fff; letter-spacing: 8px; padding: 20px 40px; background: #fff; color: #333; border-radius: 6px;">
          ${code}
        </span>
      </div>
    </div>
    
    <div style="background-color: #e6f7ff; border: 1px solid #91d5ff; border-radius: 6px; padding: 16px; margin: 20px 0;">
      <div style="display: flex; align-items: flex-start;">
        <span style="color: #1890ff; margin-right: 8px;">🎉</span>
        <div>
          <strong style="color: #096dd9;">注册说明：</strong>
          <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #555;">
            <li>验证码有效期为 <strong>5 分钟</strong></li>
            <li>验证成功后将自动创建账户</li>
            <li>可使用邮箱直接登录</li>
          </ul>
        </div>
      </div>
    </div>
    <p style="color: #888; font-size: 13px;">如非本人操作，请忽略此邮件。</p>
  `;

  const mailContent = createMailTemplate(
    "注册验证码",
    content,
    "立即开启您的 Deep Sea 之旅！"
  );

  let mailOptions = {
    from: '"Deep Sea 官方" <3829626016@qq.com>',
    to: mail,
    subject: "【Deep Sea】注册验证码",
    html: mailContent,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}
// 邮箱验证 - 登录场景
function verifyEmailForLogin(mail, code) {
  const content = `
    <p>尊敬的用户，您好！</p>
    <p>您正在登录 Deep Sea 服务，验证码为：</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 3px; border-radius: 8px;">
        <span style="display: inline-block; font-size: 28px; font-weight: bold; color: #fff; letter-spacing: 8px; padding: 20px 40px; background: #fff; color: #333; border-radius: 6px;">
          ${code}
        </span>
      </div>
    </div>
    
    <div style="background-color: #f6ffed; border: 1px solid #b7eb8f; border-radius: 6px; padding: 16px; margin: 20px 0;">
      <div style="display: flex; align-items: flex-start;">
        <span style="color: #52c41a; margin-right: 8px;">🔐</span>
        <div>
          <strong style="color: #389e0d;">安全提醒：</strong>
          <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #555;">
            <li>验证码有效期为 <strong>5 分钟</strong></li>
            <li>请勿泄露给他人</li>
            <li>如非本人操作，请忽略此邮件</li>
          </ul>
        </div>
      </div>
    </div>
    
    <p style="color: #888; font-size: 13px; text-align: center;">
      如有疑问，请联系客服：<a href="mailto:3829626016@qq.com" style="color: #1890ff; text-decoration: none;">3829626016@qq.com</a>
    </p>
  `;

  const mailContent = createMailTemplate(
    "登录验证码",
    content,
    "为您的账户安全保驾护航"
  );

  let mailOptions = {
    from: '"Deep Sea 官方" <3829626016@qq.com>',
    to: mail,
    subject: "【Deep Sea】登录验证码",
    html: mailContent,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

// 通知留言墙墙主删除留言墙
function notifyWallOwner(mail, content, reportReason = "内容不符合平台规范") {
  const truncatedContent =
    content.length > 200 ? content.substring(0, 200) + "..." : content;

  const mailContent = `
    <p>亲爱的用户，您好：</p>
    <p>我们收到其他用户反馈，关于您在留言墙上发布的部分内容可能需要进一步确认：</p>
    
    <div style="background-color: #fff2e8; border: 1px solid #ffbb96; border-radius: 6px; padding: 16px; margin: 20px 0;">
      <div style="display: flex; align-items: flex-start;">
        <span style="color: #fa8c16; margin-right: 8px;">⚠️</span>
        <div>
          <strong style="color: #d46b08;">待确认内容：</strong>
          <div style="margin-top: 8px; padding: 12px; background: #fff; border-radius: 4px; border-left: 3px solid #fa8c16;">
            <p style="margin: 0; color: #666; font-style: italic;">"${truncatedContent}"</p>
          </div>
          <p style="margin: 8px 0 0 0; color: #666;">反馈原因：${reportReason}</p>
        </div>
      </div>
    </div>
    
    <div style="background-color: #f6ffed; border: 1px solid #b7eb8f; border-radius: 6px; padding: 16px; margin: 20px 0;">
      <div style="display: flex; align-items: flex-start;">
        <span style="color: #52c41a; margin-right: 8px;">💡</span>
        <div>
          <strong style="color: #389e0d;">温馨提示：</strong>
          <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #555;">
            <li>请您抽时间检查一下该留言内容是否符合社区规范</li>
            <li>如果发现确实有不合适的地方，建议您及时修改或删除</li>
            <li>如果您认为内容没有问题，也可以忽略此通知</li>
          </ul>
        </div>
      </div>
    </div>
    
    <p style="color: #888; font-size: 13px;">感谢您的理解与支持，让我们一起维护一个健康、温暖的平台环境！</p>
  `;

  const mailOptions = {
    from: '"Deep Sea 官方" <3829626016@qq.com>',
    to: mail,
    subject: "【Deep Sea】留言墙内容温馨提醒",
    html: createMailTemplate("内容提醒", mailContent, "共建和谐友好的平移空间"),
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

module.exports = {
  createSixNum,
  sendPasswordReset,
  verifyEmailForRegister,
  verifyEmailForLogin,
  notifyWallOwner,
};
