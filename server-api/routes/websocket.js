const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });
wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    // 广播到所有客户端，但排除发送该消息的客户端
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
  ws.on("close", () => {
    console.log("WebSocket连接已关闭");
  });
  console.log("新客户端已连接");
});

wss.on("error", (error) => {
  console.error("WebSocket error:", error);
});

console.log("WebSocket服务器已启动，监听端口 8080");
