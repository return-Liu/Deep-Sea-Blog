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

// 发送密码重置邮件
function sendPasswordReset(mail, code) {
  const content = `
    <p>尊敬的用户，您好：</p>
    <p>我们收到了您重置 Deep Sea 账户密码的请求。请使用以下验证码完成身份验证：</p>
    
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
          <strong style="color: #389e0d;">安全提示：</strong>
          <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #555;">
            <li>验证码有效期为 <strong>5 分钟</strong>，请尽快使用</li>
            <li>请勿将验证码透露给他人</li>
            <li>如非本人操作，请立即忽略此邮件</li>
          </ul>
        </div>
      </div>
    </div>
    
    <p style="color: #888; font-size: 13px;">如果您没有请求重置密码，请忽略此邮件，您的账户将保持安全。</p>
  `;

  const mailContent = createMailTemplate(
    "密码重置验证",
    content,
    "感谢您使用 Deep Sea 服务！<br>祝您生活愉快！"
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
    <p>尊敬的用户，您好：</p>
    <p>欢迎注册 Deep Sea 服务！我们检测到您的邮箱尚未注册，系统将为您自动创建账户。</p>
    <p>请使用以下验证码完成注册：</p>
    
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
            <li>验证成功后系统将自动为您创建账户</li>
            <li>您可以使用该邮箱直接登录平台</li>
          </ul>
        </div>
      </div>
    </div>

    <div style="background-color: #f6ffed; border: 1px solid #b7eb8f; border-radius: 6px; padding: 16px; margin: 20px 0;">
      <div style="display: flex; align-items: flex-start;">
        <span style="color: #52c41a; margin-right: 8px;">🚀</span>
        <div>
          <strong style="color: #389e0d;">登录后您可以：</strong>
          <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #555;">
            <li><strong>创建个人留言墙</strong> - 打造专属的互动空间</li>
            <li><strong>个性化装扮</strong> - 自定义昵称颜色、头像等</li>
            <li><strong>账号安全保障</strong> - 查看和管理登录设备</li>
            <li><strong>社区互动</strong> - 与其他用户交流分享</li>
          </ul>
        </div>
      </div>
    </div>

    <div style="background-color: #fff7e6; border: 1px solid #ffd591; border-radius: 6px; padding: 16px; margin: 20px 0;">
      <div style="display: flex; align-items: flex-start;">
        <span style="color: #fa8c16; margin-right: 8px;">💡</span>
        <div>
          <strong style="color: #d46b08;">快速开始：</strong>
          <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #555;">
            <li>完成注册后，系统会为您生成随机用户名和密码</li>
            <li>建议登录后及时完善个人资料</li>
            <li>您可以在设置中修改昵称和相关信息</li>
            <li>支持绑定手机号，提升账户安全性</li>
          </ul>
        </div>
      </div>
    </div>
    
    <p style="color: #888; font-size: 13px;">如果您没有进行注册操作，请忽略此邮件，您的邮箱将不会被注册。</p>
  `;

  const mailContent = createMailTemplate(
    "邮箱注册验证",
    content,
    "立即开启您的 Deep Sea 之旅！"
  );

  let mailOptions = {
    from: '"Deep Sea 官方" <3829626016@qq.com>',
    to: mail,
    subject: "【Deep Sea】注册验证码 - 开启您的专属空间",
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
    <p>尊敬的用户，您好：</p>
    <p>您正在登录 Deep Sea 服务。为了确保账户安全，请使用以下验证码完成登录验证：</p>
    
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
          <strong style="color: #389e0d;">安全提示：</strong>
          <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #555;">
            <li>验证码有效期为 <strong>5 分钟</strong>，请尽快使用</li>
            <li>请勿将验证码分享给他人，包括客服人员</li>
            <li>本次登录的设备信息将会被记录</li>
          </ul>
        </div>
      </div>
    </div>

    <div style="background-color: #fff2e8; border: 1px solid #ffbb96; border-radius: 6px; padding: 16px; margin: 20px 0;">
      <div style="display: flex; align-items: flex-start;">
        <span style="color: #fa8c16; margin-right: 8px;">⚠️</span>
        <div>
          <strong style="color: #d46b08;">账户安全提醒：</strong>
          <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #555;">
            <li>如非本人操作，请<strong>立即修改密码</strong></li>
            <li>建议定期检查<strong>登录设备管理</strong></li>
            <li>发现异常登录请及时联系客服</li>
          </ul>
        </div>
      </div>
    </div>
    
    <p style="color: #888; font-size: 13px; text-align: center;">
      如果您没有尝试登录，请忽略此邮件，或<a href="mailto:3829626016@qq.com" style="color: #1890ff; text-decoration: none;">联系客服</a>核查账户安全。
    </p>
  `;

  const mailContent = createMailTemplate(
    "登录安全验证",
    content,
    "为您的账户安全保驾护航"
  );

  let mailOptions = {
    from: '"Deep Sea 官方" <3829626016@qq.com>',
    to: mail,
    subject: "【Deep Sea】登录验证码 - 账户安全验证",
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
function notifyWallOwner(mail, content, reportReason = "内容不符合社区规范") {
  const truncatedContent =
    content.length > 200 ? content.substring(0, 200) + "..." : content;

  const mailContent = `
    <p>尊敬的用户，您好：</p>
    <p>我们收到用户反馈，您创建的留言墙内容需要进一步核实：</p>
    
    <div style="background-color: #fff2e8; border: 1px solid #ffbb96; border-radius: 6px; padding: 16px; margin: 20px 0;">
      <div style="display: flex; align-items: flex-start;">
        <span style="color: #fa8c16; margin-right: 8px;">⚠️</span>
        <div>
          <strong style="color: #d46b08;">待核实内容：</strong>
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
          <strong style="color: #389e0d;">处理建议：</strong>
          <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #555;">
            <li>请核实该留言墙内容是否符合社区规范</li>
            <li>如确认内容不当，请及时处理或删除</li>
            <li>如认为内容无误，可忽略此通知</li>
          </ul>
        </div>
      </div>
    </div>
    
    <p style="color: #888; font-size: 13px;">感谢您对维护社区环境的支持与配合！</p>
  `;

  const mailOptions = {
    from: '"Deep Sea 官方" <3829626016@qq.com>',
    to: mail,
    subject: "【Deep Sea】留言墙内容核实通知",
    html: createMailTemplate(
      "内容核实通知",
      mailContent,
      "共同营造健康积极的社区环境"
    ),
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
