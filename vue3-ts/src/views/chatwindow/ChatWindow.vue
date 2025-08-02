<template>
  <div class="chat-window">
    <div class="messages" ref="messageContainer">
      <div v-for="(msg, index) in messages" :key="index" class="message">
        <div
          class="avatar"
          :class="{ 'user-avatar': msg.isUser }"
          style="margin-right: 5px"
        >
          <img
            :src="msg.isUser ? userAvatar : botAvatar"
            alt="Avatar"
            @click="handleAvatar(msg.isUser)"
          />
        </div>
        <div :class="['bubble', msg.isUser ? 'user' : 'bot']">
          {{ msg.text }}
        </div>
      </div>
      <!-- 添加当前正在打印的回复显示 -->
      <div v-if="currentReply" class="message">
        <div class="avatar" style="margin-right: 5px">
          <img :src="botAvatar" alt="Avatar" />
        </div>
        <div class="bubble bot">
          {{ currentReply }}
        </div>
      </div>
    </div>
    <div v-if="isThinking" class="thinking-indicator">
      <p>正在思考中... 深度推理模型X1正在努力为您提供最优解答，请耐心等待。</p>
    </div>
    <!-- 深度思考 -->
    <div
      class="deep-container"
      @click="toggleDeepThink"
      :class="{ selected: deepThinkEnabled }"
    >
      <div class="deep-img">
        <img
          src="https://static.nowcoder.com/fe/file/oss/2025022017400396407322451.png"
          alt=""
        />
      </div>
      <div class="deep-think-toggle">
        <label for="deepThinkToggle"
          >深度思考
          <p style="font-size: 10px; margin-top: 0px">DeepSeek R1</p>
        </label>
      </div>
    </div>
    <div class="input-container">
      <div class="input-area">
        <el-input
          v-model="inputText"
          :disabled="loading"
          placeholder="输入你想问的...."
          @keyup.enter="handleEnter"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 4 }"
          resize="none"
          class="custom-input"
        />
        <div class="send-button">
          <el-button
            type="primary"
            :loading="loading"
            :disabled="!inputText.trim()"
            @click="sendMessage"
            class="custom-button"
            :title="loading ? '消息发送中...' : '发送消息'"
          >
            {{ loading ? "发送中..." : "发送" }}
          </el-button>
        </div>
      </div>
    </div>
    <!-- 建议 -->
    <div class="disclaimer-section">
      <p>
        <strong style="color: #ff0000">注意事项：</strong>
        您可以与智能体深度推理模型X1进行多轮对话，直至获取满意的回答。然而，请注意其回复可能并非始终准确或完整，建议您在使用时保持理性判断，并结合实际情况做出决策。
      </p>
      <p>
        <strong style="color: #ff0000">免责声明：</strong>
        智能体深度推理模型X1提供的信息仅供参考，不构成专业意见或法律效力。请您在使用过程中注意保护个人隐私及敏感信息，并遵守相关法律法规与社会公德，避免发布不当内容。
      </p>
      <p>
        <strong style="color: #ff0000">用户提示：</strong>
        如在使用过程中遇到任何问题或有任何建议，欢迎前往“建议与反馈”模块提交反馈，我们将持续优化服务并为您提供支持。
      </p>
      <p>
        <strong style="color: #ff0000">网络问题: </strong>
        在使用智能体深度推理模型X1时，回答可能会受到网络状况的影响。如果遇到连接不稳定或延迟较高的情况，请检查您的网络连接或稍后再试。
      </p>
      <p>
        <strong style="color: #ff0000">DeepSeek R1满血版</strong>
        加入DeepSeek R1满血版，可获得更智能的回答。
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useUserStore } from "../../store/userStore";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import { modelID, modelKey, modelSECRET } from "../../config";
import * as base64 from "base-64";
import CryptoJs from "crypto-js";
const userStore = useUserStore();
const router = useRouter();
const inputText = ref("");
const loading = ref(false);
const messages = ref<{ text: string; isUser: boolean }[]>([]);
const messageContainer = ref<HTMLElement | null>(null);
const isThinking = ref(false); // 控制"正在思考中"提示的显示
const botAvatar =
  "https://www.aitool6.com/wp-content/uploads/2023/06/9557d1-8.png";
const userAvatar = ref("");
let ws: WebSocket | null = null;
const APPID = modelID;
const APIKey = modelKey;
const APISecret = modelSECRET;
const version = "v1/x1";
const replyContent = ref("");
const historyList = ref<{ role: string; content: string }[]>([]);
const deepThinkEnabled = ref(false); // 默认关闭深度思考模式
const currentReply = ref(""); // 存储当前显示的回复（用于打字机效果）
let typeWriterTimer: number | null = null;
onMounted(() => {
  userAvatar.value =
    userStore.user?.avatar ||
    "https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png";
  // 初始化 WebSocket 连接
  connectWebSocket();
});
// 清除打字机定时器的函数
const clearTypeWriter = () => {
  if (typeWriterTimer !== null) {
    clearInterval(typeWriterTimer);
    typeWriterTimer = null;
  }
};
const toggleDeepThink = () => {
  ElMessage.info("深度思考模式正在开发中，敬请期待！");
};

// 获取鉴权URL地址
const getWebsocketUrl = () => {
  return new Promise((resolve) => {
    const url = "wss://spark-api.xf-yun.com/" + version;
    const host = "spark-api.xf-yun.com";
    const date = new Date().toUTCString();
    const algorithm = "hmac-sha256";
    const headers = "host date request-line";
    // 修改签名原文格式
    const signatureOrigin = [
      `host: ${host}`,
      `date: ${date}`,
      `GET /${version} HTTP/1.1`,
    ].join("\n");
    const signatureSha = CryptoJs.HmacSHA256(signatureOrigin, APISecret);
    const signature = CryptoJs.enc.Base64.stringify(signatureSha);
    const authorizationOrigin = [
      `api_key="${APIKey}"`,
      `algorithm="${algorithm}"`,
      `headers="${headers}"`,
      `signature="${signature}"`,
    ].join(", ");
    const authorization = base64.encode(authorizationOrigin);
    const finalUrl = `${url}?authorization=${encodeURIComponent(
      authorization
    )}&date=${encodeURIComponent(date)}&host=${host}`;
    resolve(finalUrl);
  });
};
const connectWebSocket = () => {
  try {
    ws = new WebSocket("ws://localhost:8080");
    ws.onopen = () => {
      console.log("Socket连接成功");
      // 添加连接成功的提示
      ElMessage.success("开始与智能体深度推理模型X1的对话吧");
    };
    ws.onmessage = (event) => {
      let msg: string;
      try {
        // 1. 先尝试解析JSON
        let data;
        try {
          data = JSON.parse(event.data);
        } catch (e) {
          // 如果解析失败，直接使用原始字符串
          msg = event.data;
          addMessage(msg, false);
          return;
        }

        // 2. 根据数据结构处理消息
        if (typeof data === "string") {
          msg = data;
        } else if (data.payload?.choices?.text) {
          // 检查是否是数组
          const textContent = Array.isArray(data.payload.choices.text)
            ? data.payload.choices.text[0].content
            : data.payload.choices.text.content;

          msg = textContent || "无效的消息内容";
        } else {
          console.warn("未知的消息格式:", data);
          msg = "收到未知格式的消息";
        }

        // 3. 添加消息到聊天窗口
        if (msg) {
          addMessage(msg, false);
        }
      } catch (error) {
        console.error("消息处理错误:", error);
        ElMessage.error({
          message: "消息处理失败",
          duration: 3000,
        });
      }
    };

    ws.onerror = (error) => {
      console.error("Socket连接失败", error);
      ElMessage.error("连接失败");
    };

    ws.onclose = () => {
      console.log("Socket连接关闭");
      setTimeout(connectWebSocket, 3000);
    };
  } catch (error) {
    console.error("WebSocket初始化失败:", error);
  }
};
const addMessage = (text: string, isUser: boolean) => {
  messages.value.push({ text, isUser });
  scrollToBottom();
};
const scrollToBottom = () => {
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
  }
};

// 发送消息
const sendMessage = async () => {
  const userMsg = inputText.value.trim();
  if (!userMsg || loading.value) return;

  loading.value = true;
  addMessage(userMsg, true);
  isThinking.value = true;
  // 保存用户消息到历史记录
  historyList.value.push({
    role: "user",
    content: userMsg,
  });

  try {
    const auUrl = await getWebsocketUrl();
    const socket = new WebSocket(auUrl as string);

    socket.addEventListener("open", () => {
      // 构建请求参数
      const params = {
        header: {
          app_id: APPID,
          uid: String(userStore.user?.id || "anonymous"), // 添加默认值
          protocol_type: "spark",
        },
        parameter: {
          chat: {
            domain: "x1",
            temperature: 0.7, // 调整温度参数
            max_tokens: 2048, // 增加token上限
            top_k: 5,
            presence_penalty: 1.0,
            frequency_penalty: 0.02,
            tools: [
              {
                type: "web_search",
                web_search: {
                  enable: true,
                  search_mode: "normal",
                },
              },
            ],
          },
        },
        payload: {
          message: {
            text: [...historyList.value],
          },
        },
      };
      socket.send(JSON.stringify(params));
    });
    // 改进消息处理
    socket.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.header.code === 0) {
          if (data.payload.choices?.text) {
            const content = data.payload.choices.text[0]?.content;
            if (content !== undefined) {
              replyContent.value += content;
            }
            if (data.header.status === 2) {
              // 启动打字机效果
              clearTypeWriter();
              let i = 0;
              const fullText = replyContent.value;

              typeWriterTimer = window.setInterval(() => {
                if (i < fullText.length) {
                  currentReply.value += fullText.charAt(i);
                  i++;
                } else {
                  clearTypeWriter();
                  addMessage(currentReply.value, false);
                  historyList.value.push({
                    role: "assistant",
                    content: currentReply.value,
                  });
                  currentReply.value = "";
                  replyContent.value = "";
                  socket.close();
                  isThinking.value = false;
                }
              }, 70); // 每20毫秒显示一个字符，可根据需要调整速度
            }
          }
        } else {
          throw new Error(data.header.message || "API返回错误");
        }
      } catch (error) {
        console.error("消息解析错误:", error);
        ElMessage.error("消息处理失败");
        clearTypeWriter();
        isThinking.value = false;
        socket.close();
      }
    });
    // 添加重试逻辑
    let retryCount = 0;
    const maxRetries = 3;

    socket.addEventListener("error", async (error) => {
      console.error("WebSocket错误:", error);
      if (retryCount < maxRetries) {
        retryCount++;
        console.log(`正在进行第 ${retryCount} 次重试...`);
        await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
        sendMessage(); // 重试发送
      } else {
        ElMessage.error("连接失败,请稍后重试");
        // 消息不发送
        socket.close();
        loading.value = false;
      }
    });

    socket.addEventListener("close", () => {
      loading.value = false;
    });
  } catch (error) {
    console.error("发送消息失败:", error);
    ElMessage.error("发送消息失败,请稍后重试");
    loading.value = false;
  }

  inputText.value = "";
};
const handleEnter = (e: KeyboardEvent) => {
  if (e.shiftKey) return; // Shift+Enter 换行
  e.preventDefault();
  sendMessage();
};
const handleAvatar = (isUser: boolean) => {
  if (!isUser) {
    ElMessage({
      message: `嘿，${userStore.user?.nickname}！我是你的智能体深度推理模型X1，这次又有什么可以帮助你的吗？`,
      type: "success",
    });
  } else {
    window.open(
      router.resolve({ name: "users", params: { uuid: userStore.user?.uuid } })
        .href
    );
  }
};
</script>

<style scoped lang="less">
@import "../../base-ui/chatWindow.less";
.deep-container {
  width: 100px;
  height: 35px;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 50px;
  display: flex;
  margin: 10px 0;
  .deep-container,
  .selected {
    background-color: #2196f3; /* 选中时的背景颜色 */
    color: var(--color-bg8);
    border-radius: 5px;
  }
  .deep-img {
    width: 16px;

    img {
      width: 16px;
      background: #ffff;
      border-radius: 10px;
    }
  }

  .deep-think-toggle {
    display: flex;
    align-items: center;
    font-size: 10px;
    margin-left: 2px;
    color: var(--color-bg8);

    label {
      margin-right: 10px;
      font-weight: bold;
    }

    .toggle-slider {
      position: relative;
      display: inline-block;
      width: 60px;
      height: 34px;
      background: var(--bg3);
      border-radius: 34px;

      &:before {
        position: absolute;
        content: "";
        height: 26px;
        width: 26px;
        left: 4px;
        bottom: 4px;
        background: var(--bg3);
        border-radius: 50%;
        transition: 0.4s;
      }

      input:checked + .toggle-slider {
        background-color: #2196f3;
      }

      input:checked + .toggle-slider:before {
        transform: translateX(26px);
      }

      input {
        opacity: 0;
        width: 0;
        height: 0;
      }
    }
  }

  p {
    margin-top: 10px;
    font-size: 14px;
    color: var(--color-bg8);
  }
}
.thinking-indicator {
  font-size: 14px;
  color: var(--color-bg8);
  margin: 10px 0;
  text-align: center;
  animation: blink 1s infinite;
}

@keyframes blink {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
  100% {
    opacity: 1;
  }
}
</style>
