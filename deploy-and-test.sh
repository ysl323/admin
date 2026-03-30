#!/bin/bash

# 完整的部署和测试脚本
# 在服务器上运行此脚本完成部署并自动测试

set -e  # 遇到错误立即退出

echo "========================================"
echo "编程英语学习系统 - 自动部署和测试"
echo "========================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. 创建目录结构
echo -e "${YELLOW}[1/10] 创建目录结构...${NC}"
mkdir -p /www/wwwroot/english-learning/{backend,frontend,logs,data}
echo -e "${GREEN}✓ 目录创建完成${NC}"

# 2. 解压部署包
echo -e "${YELLOW}[2/10] 解压部署包...${NC}"
cd /root
if [ -f "deploy-package.zip" ]; then
    unzip -o deploy-package.zip -d /www/wwwroot/english-learning
    echo -e "${GREEN}✓ 解压完成${NC}"
else
    echo -e "${RED}错误：找不到 deploy-package.zip${NC}"
    exit 1
fi

# 3. 配置环境变量
echo -e "${YELLOW}[3/10] 配置环境变量...${NC}"
cd /www/wwwroot/english-learning/backend
if [ ! -f ".env" ]; then
    cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
DB_DIALECT=sqlite
DB_STORAGE=../data/database.sqlite
SESSION_SECRET=production-secret-key-change-this-$(date +%s)
SESSION_NAME=english_learning_session
CORS_ORIGIN=http://47.97.185.117
LOG_LEVEL=info
LOG_DIR=../logs
TTS_APP_ID=2128862431
TTS_ACCESS_TOKEN=your-tts-token-here
EOF
fi
echo -e "${GREEN}✓ 环境变量配置完成${NC}"

# 4. 检查 Node.js
echo -e "${YELLOW}[4/10] 检查 Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}错误：未安装 Node.js${NC}"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js 版本: $NODE_VERSION${NC}"

# 5. 检查依赖
echo -e "${YELLOW}[5/10] 检查依赖...${NC}"
if [ ! -d "node_modules" ]; then
    echo "安装依赖..."
    npm install --production
fi
echo -e "${GREEN}✓ 依赖检查完成${NC}"

# 6. 停止旧服务
echo -e "${YELLOW}[6/10] 停止旧服务...${NC}"
pm2 delete english-backend 2>/dev/null || true
echo -e "${GREEN}✓ 旧服务已停止${NC}"

# 7. 启动后端服务
echo -e "${YELLOW}[7/10] 启动后端服务...${NC}"
pm2 start src/index.js --name english-backend \
  --log ../logs/backend.log \
  --error ../logs/backend-error.log \
  --time
pm2 save
echo -e "${GREEN}✓ 后端服务已启动${NC}"

# 等待服务启动
echo "等待服务启动..."
sleep 5

# 8. 配置 Nginx
echo -e "${YELLOW}[8/10] 配置 Nginx...${NC}"
cat > /etc/nginx/conf.d/english-learning.conf << 'EOF'
server {
    listen 80;
    server_name 47.97.185.117;

    # 前端静态文件
    location / {
        root /www/wwwroot/english-learning/frontend/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
        
        # 缓存静态资源
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
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
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 健康检查
    location /health {
        proxy_pass http://localhost:3000;
        access_log off;
    }

    # 日志
    access_log /var/log/nginx/english-learning-access.log;
    error_log /var/log/nginx/english-learning-error.log;
}
EOF

# 测试并重载 Nginx
nginx -t
if [ $? -eq 0 ]; then
    nginx -s reload
    echo -e "${GREEN}✓ Nginx 配置完成并重载${NC}"
else
    echo -e "${RED}错误：Nginx 配置测试失败${NC}"
    exit 1
fi

# 9. 测试后端服务
echo -e "${YELLOW}[9/10] 测试后端服务...${NC}"

# 测试健康检查
echo "测试健康检查..."
HEALTH_CHECK=$(curl -s http://localhost:3000/health)
if echo "$HEALTH_CHECK" | grep -q "ok"; then
    echo -e "${GREEN}✓ 健康检查通过${NC}"
else
    echo -e "${RED}✗ 健康检查失败${NC}"
    echo "响应: $HEALTH_CHECK"
fi

# 测试数据库连接
echo "测试数据库连接..."
DB_TEST=$(curl -s http://localhost:3000/api/test-db)
if echo "$DB_TEST" | grep -q "success"; then
    echo -e "${GREEN}✓ 数据库连接正常${NC}"
else
    echo -e "${RED}✗ 数据库连接失败${NC}"
    echo "响应: $DB_TEST"
fi

# 10. 测试前端访问
echo -e "${YELLOW}[10/10] 测试前端访问...${NC}"

# 测试首页
echo "测试首页..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ 首页访问正常 (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}✗ 首页访问失败 (HTTP $HTTP_CODE)${NC}"
fi

# 测试 API 代理
echo "测试 API 代理..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/test-db)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ API 代理正常 (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}✗ API 代理失败 (HTTP $HTTP_CODE)${NC}"
fi

echo ""
echo "========================================"
echo "部署完成！"
echo "========================================"
echo ""

# 显示服务状态
echo -e "${YELLOW}服务状态：${NC}"
pm2 status

echo ""
echo -e "${YELLOW}访问信息：${NC}"
echo "  网站地址: http://47.97.185.117"
echo "  管理后台: http://47.97.185.117/admin"
echo "  默认账号: admin / admin123"

echo ""
echo -e "${YELLOW}日志位置：${NC}"
echo "  后端日志: /www/wwwroot/english-learning/logs/backend.log"
echo "  错误日志: /www/wwwroot/english-learning/logs/backend-error.log"
echo "  Nginx 日志: /var/log/nginx/english-learning-*.log"

echo ""
echo -e "${YELLOW}常用命令：${NC}"
echo "  查看日志: pm2 logs english-backend"
echo "  重启服务: pm2 restart english-backend"
echo "  查看状态: pm2 status"
echo "  查看监控: pm2 monit"

echo ""
echo -e "${GREEN}部署和测试完成！${NC}"
