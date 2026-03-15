#!/bin/bash

# 服务器部署脚本
# 在服务器上运行此脚本来设置环境

echo "========================================="
echo "服务器环境设置"
echo "========================================="

# 1. 创建目录结构
echo "[1/6] 创建目录结构..."
mkdir -p /www/wwwroot/english-learning/backend
mkdir -p /www/wwwroot/english-learning/frontend
mkdir -p /www/wwwroot/english-learning/logs
mkdir -p /www/wwwroot/english-learning/data
echo "✓ 目录创建完成"

# 2. 解压部署包
echo "[2/6] 解压部署包..."
cd /root
if [ -f "deploy-package.zip" ]; then
    unzip -o deploy-package.zip -d /www/wwwroot/english-learning
    echo "✓ 解压完成"
else
    echo "错误：找不到 deploy-package.zip"
    exit 1
fi

# 3. 配置环境变量
echo "[3/6] 配置环境变量..."
cd /www/wwwroot/english-learning/backend
cat > .env << 'EOF'
# 服务器配置
NODE_ENV=production
PORT=3000

# 数据库配置
DB_DIALECT=sqlite
DB_STORAGE=../data/database.sqlite

# Session 配置
SESSION_SECRET=your-production-secret-key-change-this
SESSION_NAME=english_learning_session

# CORS 配置
CORS_ORIGIN=http://47.97.185.117

# 日志配置
LOG_LEVEL=info
LOG_DIR=../logs

# TTS 配置
TTS_APP_ID=2128862431
TTS_ACCESS_TOKEN=your-tts-token-here
EOF
echo "✓ 环境变量配置完成"

# 4. 安装依赖（如果需要）
echo "[4/6] 检查依赖..."
if [ ! -d "node_modules" ]; then
    echo "安装 Node.js 依赖..."
    npm install --production
fi
echo "✓ 依赖检查完成"

# 5. 配置 PM2
echo "[5/6] 配置 PM2..."
pm2 delete english-backend 2>/dev/null || true
pm2 start src/index.js --name english-backend --log ../logs/backend.log --error ../logs/backend-error.log
pm2 save
pm2 startup
echo "✓ PM2 配置完成"

# 6. 配置 Nginx
echo "[6/6] 配置 Nginx..."
cat > /etc/nginx/conf.d/english-learning.conf << 'EOF'
server {
    listen 80;
    server_name 47.97.185.117;

    # 前端静态文件
    location / {
        root /www/wwwroot/english-learning/frontend/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # API 代理
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

# 测试 Nginx 配置
nginx -t
if [ $? -eq 0 ]; then
    nginx -s reload
    echo "✓ Nginx 配置完成并重载"
else
    echo "错误：Nginx 配置测试失败"
    exit 1
fi

echo ""
echo "========================================="
echo "部署完成！"
echo "========================================="
echo ""
echo "服务状态："
pm2 status
echo ""
echo "访问地址: http://47.97.185.117"
echo ""
echo "常用命令："
echo "  查看日志: pm2 logs english-backend"
echo "  重启服务: pm2 restart english-backend"
echo "  停止服务: pm2 stop english-backend"
echo ""
