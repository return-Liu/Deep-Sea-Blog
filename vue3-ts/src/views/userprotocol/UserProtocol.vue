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
      <p>
        在使用服务前，请仔细阅读本协议。如您不同意本协议，请勿使用本平台。
        本协议可能随时更新，更新后的协议将在平台上发布后立即生效。
        您继续使用平台即表示您同意接受修订后的协议。
      </p>
      <p>
        我们建议您定期查看本协议以及我们的
        <router-link to="/privacy">隐私政策</router-link
        >，以了解我们如何收集、使用和保护您的个人信息。
      </p>
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
        <li>
          禁止上传、发布或传播任何包含恶意软件、病毒或其他有害程序的内容。
        </li>
        <li>不得侵犯他人的知识产权、隐私权或其他合法权益。</li>
        <li>
          禁止滥用平台资源，包括但不限于发送垃圾邮件、进行分布式拒绝服务攻击（DDoS）等。
        </li>
      </ul>
    </section>

    <section>
      <h2>3. 账户注册与管理</h2>
      <p>
        在注册 Deep Sea 账户时，您需提供真实、准确的信息，并承担信息保密义务。
        您应对与您的账户相关的所有活动负责，包括但不限于行为后果和数据提交。
      </p>
      <p>
        您应妥善保管账户密码，并定期更改密码以确保账户安全。
        如果您发现任何未经授权的账户使用情况，请立即通知我们，我们将协助处理。
      </p>
      <p>
        如果您提供的信息发生变更（例如电子邮件地址或联系方式），请及时更新您的账户信息。
        因未及时更新信息而导致的任何问题，由您自行承担责任。
      </p>
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
      <p>
        对于用户生成内容（UGC），您保留对其的所有权，但您授予 Deep Sea
        一个全球范围内的、非独占的、免费的许可，允许我们使用、复制、修改、改编、发布和展示您的内容，
        以便在平台上提供服务。
      </p>
    </section>

    <section>
      <h2>5. 免责声明与责任限制</h2>
      <p>Deep Sea 尽力确保平台的稳定性和安全性，但我们不对以下情况承担责任：</p>
      <ul>
        <li>因不可抗力导致的服务中断或数据丢失。</li>
        <li>因第三方攻击（如黑客入侵、病毒传播）造成的损失。</li>
        <li>因用户自身操作不当或违反本协议导致的问题。</li>
      </ul>
      <p>
        在任何情况下，Deep Sea
        对于任何间接、特殊、偶然或后果性的损害（包括但不限于利润损失、业务中断）不承担责任。
      </p>
    </section>

    <section>
      <h2>6. 争议解决</h2>
      <p>
        本协议受中华人民共和国法律管辖并按其解释。
        如因本协议产生任何争议，双方应首先通过友好协商解决；协商不成的，任何一方均可将争议提交至平台所在地有管辖权的人民法院诉讼解决。
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
