# 服务器部署指南

## 服务器信息
- IP: 47.97.185.117
- 用户: root
- 密码: Admin88868
- SSH 端口: 22

## 快速部署步骤

### 方法 1: 自动部署（推荐）

1. **在本地运行部署脚本**
```bash
cd my1
.\deploy-to-server.bat
```

这个脚本会自动：
- 检查前端构建文件
- 创建部署包
- 上传到服务器
- 在服务器上部署

### 方法 2: 手动部署

#### 步骤 1: 本地准备

1. 构建前端（如果还没构建）
```bash
cd my1/frontend
npm run build
```

2. 创建部署包
```bash
# 在 my1 目录下
mkdir deploy-package
mkdir deploy-package\backend
mkdir deploy-package\frontend

# 复制后端文件
xcopy /E /I /Y backend\src deploy-package\backend\src
xcopy /E /I /Y backend\node_modules deploy-package\backend\node_modules
copy backend\package.json deploy-package\backend\
copy backend\.env deploy-package\backend\

# 复制前端构建文件
xcopy /E /I /Y frontend\dist deploy-package\frontend\dist

# 压缩
powershell -Command "Compress-Archive -Path deploy-package\* -DestinationPath deploy-package.zip -Force"
```

#### 步骤 2: 上传到服务器

使用 SCP 上传：
```bash
scp -P 22 deploy-package.zip root@47.97.185.117:/root/
```

或使用 FTP 工具（如 FileZilla）上传到 `/root/`

#### 步骤 3: 在服务器上部署

1. SSH 连接到服务器
```bash
ssh -p 22 root@47.97.185.117
# 密码: Admin88868
```

2. 运行部署脚本
```bash
cd /root
chmod +x server-setup.sh
./server-setup.sh
```

或手动执行：

```bash
# 创建目录
mkdir -p /www/wwwroot/english-learning/{backend,frontend,logs,data}

# 解压文件
cd /root
unzip -o deploy-package.zip -d /www/wwwroot/english-learning

# 配置环境变量
cd /www/wwwroot/english-learning/backend
cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
DB_DIALECT=sqlite
DB_STORAGE=../data/database.sqlite
SESSION_SECRET=your-production-secret-key-change-this
SESSION_NAME=english_learning_session
CORS_ORIGIN=http://47.97.185.117
LOG_LEVEL=info
LOG_DIR=../logs
TTS_APP_ID=2128862431
TTS_ACCESS_TOKEN=your-tts-token-here
EOF

# 启动后端服务
pm2 delete english-backend 2>/dev/null || true
pm2 start src/index.js --name english-backend --log ../logs/backend.log
pm2 save
pm2 startup

# 配置 Nginx
cat > /etc/nginx/conf.d/english-learning.conf << 'EOF'
server {
    listen 80;
    server_name 47.97.185.117;

    location / {
        root /www/wwwroot/english-learning/frontend/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

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

    location /health {
        proxy_pass http://localhost:3000;
        access_log off;
    }
}
EOF

# 重载 Nginx
nginx -t && nginx -s reload
```

## 验证部署

1. 检查服务状态
```bash
pm2 status
pm2 logs english-backend
```

2. 测试 API
```bash
curl http://localhost:3000/health
```

3. 访问网站
打开浏览器访问: http://47.97.185.117

## 常用管理命令

### PM2 进程管理
```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs english-backend

# 重启服务
pm2 restart english-backend

# 停止服务
pm2 stop english-backend

# 删除服务
pm2 delete english-backend
```

### Nginx 管理
```bash
# 测试配置
nginx -t

# 重载配置
nginx -s reload

# 重启 Nginx
systemctl restart nginx

# 查看状态
systemctl status nginx
```

### 日志查看
```bash
# 后端日志
tail -f /www/wwwroot/english-learning/logs/backend.log
tail -f /www/wwwroot/english-learning/logs/backend-error.log

# Nginx 日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## 更新部署

当有代码更新时：

1. 在本地重新构建
```bash
cd my1/frontend
npm run build
```

2. 重新运行部署脚本
```bash
cd my1
.\deploy-to-server.bat
```

或者只更新特定部分：

### 只更新前端
```bash
# 本地
cd my1/frontend
npm run build
scp -r dist/* root@47.97.185.117:/www/wwwroot/english-learning/frontend/dist/

# 不需要重启服务
```

### 只更新后端
```bash
# 本地
scp -r backend/src/* root@47.97.185.117:/www/wwwroot/english-learning/backend/src/

# 服务器
ssh root@47.97.185.117
pm2 restart english-backend
```

## 故障排查

### 服务无法启动
```bash
# 查看详细日志
pm2 logs english-backend --lines 100

# 检查端口占用
netstat -tlnp | grep 3000

# 手动启动测试
cd /www/wwwroot/english-learning/backend
node src/index.js
```

### 前端无法访问
```bash
# 检查 Nginx 配置
nginx -t

# 检查文件权限
ls -la /www/wwwroot/english-learning/frontend/dist/

# 查看 Nginx 错误日志
tail -f /var/log/nginx/error.log
```

### API 请求失败
```bash
# 检查后端服务
pm2 status
curl http://localhost:3000/health

# 检查 Nginx 代理配置
cat /etc/nginx/conf.d/english-learning.conf
```

## 安全建议

1. 修改默认密码
```bash
# 修改 root 密码
passwd

# 修改 .env 中的 SESSION_SECRET
vi /www/wwwroot/english-learning/backend/.env
```

2. 配置防火墙
```bash
# 只开放必要端口
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

3. 配置 HTTPS（推荐）
```bash
# 使用 Let's Encrypt
certbot --nginx -d yourdomain.com
```

## 备份

### 备份数据库
```bash
# 备份 SQLite 数据库
cp /www/wwwroot/english-learning/data/database.sqlite /root/backup/database-$(date +%Y%m%d).sqlite
```

### 备份配置
```bash
# 备份配置文件
tar -czf /root/backup/config-$(date +%Y%m%d).tar.gz \
  /www/wwwroot/english-learning/backend/.env \
  /etc/nginx/conf.d/english-learning.conf
```

## 监控

### 设置自动重启
PM2 已配置自动重启，如果进程崩溃会自动恢复。

### 设置开机自启
```bash
pm2 startup
pm2 save
```

### 监控资源使用
```bash
pm2 monit
```

## 联系信息

如有问题，请检查：
1. 后端日志: `/www/wwwroot/english-learning/logs/`
2. PM2 日志: `pm2 logs english-backend`
3. Nginx 日志: `/var/log/nginx/`
