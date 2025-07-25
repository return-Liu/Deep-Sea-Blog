<template>
  <div class="support-we">
    <!-- 创意头部 -->
    <header class="support-header">
      <h1>携手 Deep Sea，共探博客新世界</h1>
      <p class="description">
        Deep Sea —— 一个由 Vue3 和 Node.js
        驱动的博客记录网站，坚持免费开放、透明共享。
        您的支持是我们不断前行的动力，让我们一起探索无限可能！
      </p>
    </header>

    <!-- 主要功能模块 -->
    <section class="main-features">
      <h2>Deep Sea 的核心功能</h2>
      <div class="feature-cards">
        <div class="feature-card">
          <i class="fas fa-images"></i>
          <h3>图片管理</h3>
          <p>轻松上传和管理图片，为您的博客文章增添色彩。</p>
        </div>

        <div class="feature-card">
          <i class="fas fa-adjust"></i>
          <h3>日间/夜间模式/系统模式</h3>
          <p>自由切换日间和夜间模式，阅读体验更舒适。</p>
        </div>
        <div class="feature-card">
          <i class="fas fa-language"></i>
          <h3>多语言支持</h3>
          <p>支持多种语言，满足不同用户的需求。</p>
        </div>
        <div class="feature-card">
          <i class="fas fa-user"></i>
          <h3>切换账号</h3>
          <p>轻松切换不同账号，管理多个博客空间。</p>
        </div>
      </div>
    </section>

    <!-- 支持方式 -->
    <!-- 支持方式 -->
    <section class="support-options">
      <h2>让 Deep Sea 更强大的力量，源自每一位你的支持</h2>
      <div class="option-cards">
        <div class="option-card">
          <h3>与我们同行</h3>
          <p>加入我们的社交圈，第一时间掌握 Deep Sea 的成长轨迹与未来蓝图。</p>
          <div class="social-links">
            <a href="#" target="_blank" rel="noopener noreferrer">
              <i class="fab fa-github"></i> GitHub
            </a>
          </div>
        </div>

        <div class="option-card">
          <h3>共建未来</h3>
          <p>
            用你的才华点亮 Deep
            Sea，无论是代码、文档，还是想法，我们都期待你的加入。
          </p>
          <button class="contribute-button">加入共建计划</button>
        </div>

        <div class="option-card">
          <h3>传递热爱</h3>
          <p>
            将 Deep Sea 分享给志同道合的朋友，让更多人一起参与这场技术旅程。
          </p>
          <button class="share-button">分享给朋友</button>
        </div>
      </div>
    </section>
    <!-- 项目愿景 -->
    <section class="vision">
      <h2>我们的愿景</h2>
      <p>
        Deep Sea 致力于打造一个开放的技术生态，推动前端与后端技术的融合与创新。
        我们相信，开源是技术进步的基石，而您的支持是我们前进的灯塔。
      </p>
    </section>
  </div>
</template>
<style lang="less" scoped>
@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap");

.support-we {
  min-height: 100vh;
  padding: 80px 20px 60px;
  font-family: "Roboto", sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.support-header {
  text-align: center;
  margin-bottom: 60px;
  max-width: 700px;

  h1 {
    font-size: 36px;
    margin-bottom: 20px;
    background: linear-gradient(to right, #4f46e5, #9333ea);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 700;
  }

  .description {
    font-size: 16px;
    color: var(--color-bg8);
    line-height: 1.8;
  }
}

.main-features {
  width: 100%;
  max-width: 1200px;
  margin-bottom: 60px;

  h2 {
    font-size: 24px;
    text-align: center;
    margin-bottom: 30px;
  }

  .feature-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 40px;
    justify-content: center;

    @media (max-width: 768px) {
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    }

    .feature-card {
      background: var(--bg3);
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      text-align: center;
      transition: transform 0.2s ease;

      &:hover {
        transform: translateY(-8px);
      }

      i {
        font-size: 48px;
        color: #4f46e5;
        margin-bottom: 16px;
      }

      h3 {
        font-size: 20px;
        margin-bottom: 12px;
      }

      p {
        font-size: 14px;
        background: var(--bg3);
        margin-bottom: 20px;
      }
    }
  }
}

.support-options {
  width: 100%;
  max-width: 1200px;
  margin-bottom: 60px;

  h2 {
    font-size: 24px;
    text-align: center;
    margin-bottom: 30px;
  }

  .option-cards {
    display: flex;
    gap: 40px;
    justify-content: center;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 30px;
    }

    .option-card {
      flex: 1;
      background: var(--bg3);
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      text-align: center;
      transition: transform 0.2s ease;

      &:hover {
        transform: translateY(-8px);
      }

      h3 {
        font-size: 20px;
        margin-bottom: 12px;
      }

      p {
        font-size: 14px;
        color: var(--color-bg8);
        margin-bottom: 20px;
      }

      .social-links {
        display: flex;
        gap: 16px;
        justify-content: center;
        a {
          display: flex;
          align-items: center;
          color: #4f46e5;
          text-decoration: none;
          transition: color 0.2s ease;

          &:hover {
            color: #9333ea;
          }

          i {
            font-size: 18px;
            margin-right: 8px;
          }
        }
      }

      .contribute-button,
      .share-button {
        display: inline-block;
        padding: 12px 24px;
        font-size: 16px;
        font-weight: bold;
        border: none;
        border-radius: 30px;
        background: linear-gradient(to right, #6ee7b7, #a855f7);
        color: var(--color-bg8);
        cursor: pointer;
        position: relative;
        overflow: hidden;
        z-index: 1;
        transition: all 0.3s ease;

        &::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 300%;
          height: 300%;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.3) 0%,
            transparent 70%
          );
          transform: translate(-50%, -50%) scale(0);
          transition: transform 0.3s ease;
          border-radius: 50%;
          z-index: 0;
        }

        &:hover::before {
          transform: translate(-50%, -50%) scale(1);
        }

        &:hover {
          box-shadow: 0 8px 20px rgba(168, 85, 247, 0.3);
        }
      }
    }
  }
}

.vision {
  width: 100%;
  max-width: 700px;
  text-align: center;

  h2 {
    font-size: 24px;
    margin-bottom: 16px;
  }

  p {
    font-size: 16px;
    color: var(--color-bg8);
    line-height: 1.8;
  }
}
</style>
