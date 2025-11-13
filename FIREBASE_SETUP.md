# Firebase 实时同步设置指南

本游戏使用 Firebase Realtime Database 实现真正的远程实时同步，支持跨设备、跨浏览器的多人游戏。

## 步骤 1：创建 Firebase 项目

1. 访问 [Firebase Console](https://console.firebase.google.com)
2. 点击"Create a new project"
3. 输入项目名称：`make24game`
4. 根据提示完成创建

## 步骤 2：获取 Firebase 配置

1. 在 Firebase Console 中选择你的项目
2. 点击左上角的项目齿轮图标 → "Project Settings"
3. 向下滚动到"Your apps"部分
4. 如果没有 Web 应用，点击"</>"图标添加 Web 应用
5. 获取配置信息，看起来像这样：

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "1:YOUR_APP_ID:web:YOUR_WEB_ID"
};
```

## 步骤 3：更新 game.js 中的配置

1. 打开 `game.js` 文件
2. 找到文件顶部的 `firebaseConfig` 对象（约在第 1-10 行）
3. 用你从 Firebase Console 获取的值替换所有占位符

示例：
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC_YOUR_ACTUAL_API_KEY",
  authDomain: "make24game-abc123.firebaseapp.com",
  projectId: "make24game-abc123",
  storageBucket: "make24game-abc123.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456"
};
```

## 步骤 4：配置 Firebase Realtime Database

1. 在 Firebase Console 中，点击左侧菜单的 "Realtime Database"
2. 点击"Create Database"
3. 选择位置（推荐选择离你最近的地区）
4. 选择"Start in test mode"（用于开发/测试）
5. 点击"Enable"

### 配置安全规则（可选，但推荐用于生产环境）

默认测试模式允许所有读写。对于生产环境，建议设置规则：

```json
{
  "rules": {
    "games": {
      "$gameId": {
        ".read": true,
        ".write": true,
        ".indexOn": ["player2Connected", "lastUpdate"]
      }
    }
  }
}
```

## 步骤 5：测试远程同步

1. **Player 1**：在一个浏览器/设备上打开 `index.html`
   - 记下显示的房间代码（如 "A3F8K2"）
   - 点击"Start Game"

2. **Player 2**：在另一个浏览器/设备上打开 `index.html`
   - 输入 Player 1 的房间代码
   - 点击"Join Game"
   - Player 1 应该立即看到"Player 2 connected!"的提示

3. **开始游戏**：
   - 两个玩家看到相同的 4 张牌
   - 两个玩家可以同时输入表达式
   - 第一个提交正确答案的玩家赢得 5 分
   - 游戏状态实时同步

## 常见问题

### Q: 如何测试本地 + 远程？
A: 
- 本地：`http://localhost:8000/index.html`（使用 `python3 -m http.server 8000`）
- 远程：使用你的电脑 IP 地址访问，例如 `http://192.168.1.100:8000/index.html`

### Q: Firebase 免费额度是多少？
A: Firebase 提供免费层级：
- 每月 100 并发连接
- 每月 1GB 数据存储
- 每月 10GB 数据下载
- 对于小规模游戏完全足够

### Q: 如何在生产环境中使用？
A: 
1. 设置更严格的安全规则
2. 启用 Firebase Authentication
3. 添加用户认证
4. 考虑添加后端 API 进行验证

### Q: 数据会被保存多久？
A: Firebase Realtime Database 中的数据会一直保存，直到被删除。你可以添加自动清理规则删除旧游戏。

## 调试技巧

1. 打开浏览器控制台（F12）查看日志
2. 查看 Firebase Console 中的 "Realtime Database" 标签，实时看到数据变化
3. 使用 Console 输出追踪同步过程

## 后续改进

- [ ] 添加用户认证
- [ ] 保存游戏历史和排行榜
- [ ] 添加自动清理旧游戏数据
- [ ] 实现房间人数限制和超时管理
- [ ] 添加断线重连机制

