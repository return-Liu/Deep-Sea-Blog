<template>
  <div class="privacy">
    <h1>隐私政策</h1>
    <p>
      欢迎访问我们的网站。我们非常重视您的隐私和数据保护。本隐私政策旨在清楚地说明我们如何收集、使用、保护以及在某些情况下如何处理通过本网站或服务提供的信息。
    </p>

    <h2>1. 我们收集的信息</h2>
    <p>我们会根据您使用的服务类型收集不同种类的信息，包括但不限于：</p>
    <ul>
      <li>个人身份信息（如姓名、电子邮件地址等）</li>
      <li>设备信息（例如浏览器类型、操作系统、IP地址等）</li>
      <li>使用数据（比如访问时间、浏览页面、点击行为等）</li>
    </ul>

    <h2>2. 使用目的</h2>
    <p>我们收集的信息可能用于以下用途：</p>
    <ul>
      <li>提供并维护我们的服务</li>
      <li>改进用户体验</li>
      <li>发送通知或与用户沟通</li>
      <li>分析和优化网站性能</li>
    </ul>

    <h2>3. 数据共享和披露</h2>
    <p>
      除非获得您的明确同意，否则我们不会向第三方出售、交易或转让您的个人信息。但在以下特殊情况下可能会进行披露：
    </p>
    <ul>
      <li>法律要求的情况下</li>
      <li>为了保护我们的权益、财产或安全</li>
    </ul>
  </div>
</template>
<style lang="less" scoped>
.privacy {
  max-width: 960px;
  margin: 0 auto;
  padding: 40px 20px;
  line-height: 1.8;
  height: 100%;
  background-color: #f9f9f9;
  font-size: 16px;
  color: #333;

  h1 {
    font-size: 28px;
    margin-bottom: 20px;
    text-align: center;
    color: #2c3e50;
  }

  h2 {
    font-size: 22px;
    margin-top: 30px;
    margin-bottom: 15px;
    color: #34495e;
  }

  p {
    margin-bottom: 15px;
  }

  ul {
    margin-bottom: 15px;
    padding-left: 20px;

    li {
      margin-bottom: 8px;
    }
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    padding: 20px 10px;
    font-size: 15px;

    h1 {
      font-size: 24px;
    }

    h2 {
      font-size: 20px;
    }
  }
}
</style>
