<template>
  <div class="terms-container">
    <h1>Deep Sea 用户协议</h1>

    <section>
      <h2>1. 协议说明</h2>
      <p>
        欢迎使用 Deep Sea
        平台！本《用户协议》适用于您对本网站及所有相关服务的访问和使用。
        通过注册、访问或使用 Deep Sea
        的任何功能，即表示您已阅读、理解并同意接受本协议的全部内容。
      </p>
      <p>在使用服务前，请仔细阅读本协议。如您不同意本协议，请勿使用本平台。</p>
    </section>

    <section>
      <h2>2. 用户使用规范</h2>
      <p>
        Deep Sea
        授予您一项有限的、非独占的、不可转让的权限，以查看和使用本平台所提供的服务，
        但前提是您必须遵守本协议中的所有规定。此权限不包括任何出售、租赁、分发或其他商业用途的权利。
      </p>
      <ul>
        <li>禁止反向工程、逆向编译或试图获取源代码。</li>
        <li>禁止利用自动化工具（如爬虫）非法抓取网站内容。</li>
        <li>不得将服务用于违法、欺诈、虚假或不当目的。</li>
      </ul>
    </section>

    <section>
      <h2>3. 账户注册与管理</h2>
      <p>
        在注册 Deep Sea 账户时，您需提供真实、准确的信息，并承担信息保密义务。
        您应对与您的账户相关的所有活动负责，包括但不限于行为后果和数据提交。
      </p>
      <p>若发现他人未经授权使用您的账户，请立即通知我们，我们将协助处理。</p>
    </section>

    <section>
      <h2>4. 所有权与使用限制</h2>
      <p>
        Deep Sea
        及其原始内容、功能以及所有设计、代码、文本、图像等均受版权、商标权及其他知识产权保护。
        所有权利归 Deep Sea 或其授权方所有。
      </p>
      <p>
        未经 Deep Sea
        明确书面许可，任何第三方不得复制、修改、传播或展示相关内容。
      </p>
    </section>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="less">
.terms-container {
  max-width: 960px;
  height: 100%;
  background-color: #f9f9f9;
  margin: 40px auto;
  padding: 0 20px;
  line-height: 1.8;
  color: #333;

  h1,
  h2 {
    color: #2c3e50;
    font-weight: bold;
  }

  h2 {
    margin-top: 40px;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
  }

  p {
    margin-bottom: 15px;
  }

  ul {
    list-style-type: disc;
    margin-left: 20px;
    margin-bottom: 15px;
  }

  li {
    margin-bottom: 8px;
  }

  a {
    color: #409eff;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
