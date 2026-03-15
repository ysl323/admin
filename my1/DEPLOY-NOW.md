# 立即部署 - 简易指南

## 🚀 快速开始

### 前提条件
✅ 前端已构建（frontend/dist 文件夹存在）
✅ 后端代码已修复（AdminService.js, AudioManager.js, 等）

### 服务器信息
```
IP: 47.97.185.117
用户: root
密码: Admin88868
端口: 22
```

---

## 方法 1: 一键部署（推荐）

### Windows 用户

1. 打开 PowerShell（以管理员身份）
2. 运行：
```powershell
cd my1
.\deploy-simple.ps1
```

### 如果没有 SSH 工具

运行这个命令安装 OpenSSH：
```powershell
# 以管理员身份运行 PowerShell
Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0
```

然后重新运行部署脚本。

---

## 方法 2: 使用 FTP 工具（最简单）

### 步骤 1: 准备文件

1. 确保前端已构建：
```bash
cd my1/frontend
npm run build
```

2. 创建部署包（在 my1 目录）：
```bash
# 创建文件夹
mkdir deploy-package
mkdir deploy-package\backend
mkdir deploy-package\frontend

# 复制文件
xcopy /E /I /Y backend\src deploy-package\backend\src
xcopy /E /I /Y backend\node_modules deploy-package\backend\node_modules
copy backend\package.json deploy-package\backend\
copy backend\.env deploy-package\backend\
xcopy /E /I /Y frontend\dist deploy-package\frontend\dist

# 压缩（右键 deploy-package 文件夹 -> 发送到 -> 压缩文件夹）
```

### 步骤 2: 使用 FTP 上传

1. 下载并安装 [FileZilla](https://filezilla-project.org/)

2. 连接到服务器：
   - 主机: `sftp://47.97.185.117`
   - 用户名: `root`
   - 密码: `Admin88868`
   - 端口: `22`

3. 上传文件：
   - 上传 `deploy-package.zip` 到 `/root/`
   - 上传 `server-setup.sh` 到 `/root/`

### 步骤 3: SSH 连接并部署

1. 使用 SSH 工具连接（如 PuTTY 或 Windows Terminal）：
```
ssh root@47.97.185.117
# 输入密码: Admin88868
```

2. 运行部署脚本：
```bash
cd /root
chmod +x server-setup.sh
./server-setup.sh
```

---

## 方法 3: 手动部署（完全控制）

### 在服务器上执行

1. SSH 连接到服务器
```bash
ssh root@47.97.185.117
```

2. 创建目录
```bash
mkdir -p /www/wwwroot/english-learning/{backend,frontend,logs,data}
```

3. 上传并解压文件（假设已上传 deploy-package.zip）
```bash
cd /root
unzip -o deploy-package.zip -d /www/wwwroot/english-learning
```

4. 配置环境变量
```bash
cd /www/wwwroot/english-learning/backend
cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
DB_DIALECT=sqlite
DB_STORAGE=../data/database.sqlite
SESSION_SECRET=change-this-to-random-string-in-production
SESSION_NAME=english_learning_session
CORS_ORIGIN=http://47.97.185.117
LOG_LEVEL=info
LOG_DIR=../logs
TTS_APP_ID=2128862431
TTS_ACCESS_TOKEN=your-tts-token-here
EOF
```

5. 启动后端服务
```bash
# 停止旧服务（如果存在）
pm2 delete english-backend 2>/dev/null || true

# 启动新服务
pm2 start src/index.js --name english-backend \
  --log ../logs/backend.log \
  --error ../logs/backend-error.log

# 保存配置
pm2 save

# 设置开机自启
pm2 startup
```

6. 配置 Nginx
```bash
cat > /etc/nginx/conf.d/english-learning.conf << 'EOF'
server {
    listen 80;
    server_name 47.97.185.117;

    # 前端
    location / {
        root /www/wwwroot/english-learning/frontend/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # 健康检查
    location /health {
        proxy_pass http://localhost:3000;
        access_log off;
    }
}
EOF

# 测试并重载 Nginx
nginx -t && nginx -s reload
```

7. 验证部署
```bash
# 检查服务状态
pm2 status

# 查看日志
pm2 logs english-backend --lines 20

# 测试 API
curl http://localhost:3000/health
```

---

## ✅ 验证部署成功

1. 打开浏览器访问: http://47.97.185.117

2. 测试功能：
   - 注册/登录
   - 查看课程列表
   - 学习单词
   - 音频播放
   - 管理后台（admin/admin123）

3. 检查修复：
   - ✅ 单词列表正常加载（无 500 错误）
   - ✅ 音频播放流畅（无冲突错误）
   - ✅ 无 Element Plus 警告

---

## 🔧 常用管理命令

### 查看服务状态
```bash
pm2 status
```

### 查看日志
```bash
# 实时日志
pm2 logs english-backend

# 最近 50 行
pm2 logs english-backend --lines 50

# 只看错误
pm2 logs english-backend --err
```

### 重启服务
```bash
pm2 restart english-backend
```

### 停止服务
```bash
pm2 stop english-backend
```

### 查看资源使用
```bash
pm2 monit
```

---

## 🐛 故障排查

### 服务无法启动
```bash
# 查看详细错误
pm2 logs english-backend --lines 100

# 手动启动测试
cd /www/wwwroot/english-learning/backend
node src/index.js
```

### 前端无法访问
```bash
# 检查 Nginx
nginx -t
systemctl status nginx

# 检查文件
ls -la /www/wwwroot/english-learning/frontend/dist/
```

### API 请求失败
```bash
# 检查后端
curl http://localhost:3000/health

# 检查端口
netstat -tlnp | grep 3000
```

---

## 📝 更新部署

当有代码更新时：

### 只更新前端
```bash
# 本地构建
cd my1/frontend
npm run build

# 上传 dist 文件夹到服务器
# 使用 FTP 或 scp
scp -r dist/* root@47.97.185.117:/www/wwwroot/english-learning/frontend/dist/
```

### 只更新后端
```bash
# 上传修改的文件
scp backend/src/services/AdminService.js root@47.97.185.117:/www/wwwroot/english-learning/backend/src/services/

# 重启服务
ssh root@47.97.185.117 "pm2 restart english-backend"
```

### 完整更新
重新运行部署脚本即可。

---

## 📞 需要帮助？

如果遇到问题：

1. 检查日志：
   - 后端: `pm2 logs english-backend`
   - Nginx: `tail -f /var/log/nginx/error.log`

2. 检查服务状态：
   - PM2: `pm2 status`
   - Nginx: `systemctl status nginx`

3. 测试连接：
   - 后端: `curl http://localhost:3000/health`
   - 前端: 浏览器访问 http://47.97.185.117

---

## 🎉 部署完成！

访问地址: **http://47.97.185.117**

默认管理员账号:
- 用户名: `admin`
- 密码: `admin123`

祝使用愉快！
