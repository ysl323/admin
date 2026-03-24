@echo off
echo ========================================
echo   一键打包英语学习网站
echo ========================================
echo.

echo 正在连接服务器并打包...
ssh -o StrictHostKeyChecking=no root@47.97.185.117 "bash -s" << 'ENDSSH'
#!/bin/bash
set -e

# 创建打包目录
PACK_DIR="/root/english-learning-backup-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$PACK_DIR"

echo "1. 备份数据库..."
cp /root/english-learning/my1/backend/database.sqlite "$PACK_DIR/"

echo "2. 备份后端代码..."
cp -r /root/english-learning/my1/backend "$PACK_DIR/"

echo "3. 备份前端代码..."
cp -r /root/english-learning/my1/frontend "$PACK_DIR/"

echo "4. 备份 Nginx 配置..."
cp /etc/nginx/sites-available/english-learning "$PACK_DIR/nginx.conf"

echo "5. 备份 PM2 配置..."
cp -r /root/.pm2 "$PACK_DIR/pm2"

echo "6. 创建部署脚本..."
cat > "$PACK_DIR/一键部署.sh" << 'DEPLOY'
#!/bin/bash
set -e

echo "========================================"
echo "  一键部署英语学习网站"
echo "========================================"

# 获取当前目录
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "1. 安装依赖（如果需要）..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
    yum install -y nodejs
fi

if ! command -v npm &> /dev/null; then
    yum install -y npm
fi

echo "2. 创建网站目录..."
mkdir -p /root/english-learning/my1

echo "3. 恢复后端..."
cp -r "$SCRIPT_DIR/backend" /root/english-learning/my1/
cd /root/english-learning/my1/backend
npm install --production 2>/dev/null || npm install

echo "4. 恢复前端..."
cp -r "$SCRIPT_DIR/frontend" /root/english-learning/my1/
cd /root/english-learning/my1/frontend
npm install 2>/dev/null || npm install
npm run build

echo "5. 恢复数据库..."
cp "$SCRIPT_DIR/database.sqlite" /root/english-learning/my1/backend/

echo "6. 配置 Nginx..."
if ! command -v nginx &> /dev/null; then
    yum install -y nginx
fi
cp "$SCRIPT_DIR/nginx.conf" /etc/nginx/sites-available/english-learning
mkdir -p /etc/nginx/sites-enabled
ln -sf /etc/nginx/sites-available/english-learning /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

echo "7. 配置 PM2..."
npm install -g pm2 2>/dev/null || true
pm2 start /root/english-learning/my1/backend/src/index.js --name english-backend
pm2 save
pm2 startup

echo "========================================"
echo "  部署完成！"
echo "  网站地址: http://$(curl -s ifconfig.me)"
echo "========================================"
DEPLOY

chmod +x "$PACK_DIR/一键部署.sh"

echo "7. 创建压缩包..."
cd /root
tar -czvf "$PACK_DIR.tar.gz" "$(basename $PACK_DIR)"

echo "8. 输出文件位置..."
ls -lh "$PACK_DIR.tar.gz"

echo ""
echo "========================================"
echo "打包完成！"
echo "文件: $PACK_DIR.tar.gz"
echo ""
echo "下载命令（在本地执行）:"
echo "scp root@47.97.185.117:$PACK_DIR.tar.gz ."
echo "========================================"
ENDSSH

echo.
echo ========================================
echo 完成！
echo ========================================
pause
