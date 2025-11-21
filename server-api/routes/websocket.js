const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 3001 });

wss.on("connection", (ws, req) => {
  // 解析查询参数获取用户UUID
  const urlParams = new URLSearchParams(req.url.split("?")[1]);
  const userUUID = urlParams.get("uuid");

  // 将用户UUID附加到WebSocket实例上
  ws.userUUID = userUUID || "unknown";

  console.log(`新客户端已连接: ${ws.userUUID}`);

  ws.on("message", (message) => {
    try {
      const messageData = JSON.parse(message);
      // 添加用户信息到消息中
      messageData.senderUUID = ws.userUUID;

      // 广播到所有客户端，但排除发送该消息的客户端
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(messageData));
        }
      });
    } catch (e) {
      // 如果不是JSON消息，则原样广播
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  });

  ws.on("close", () => {
    console.log(`WebSocket连接已关闭: ${ws.userUUID}`);
  });
});

wss.on("error", (error) => {
  console.error("WebSocket error:", error);
});

console.log("WebSocket服务器已启动，监听端口 3001");
