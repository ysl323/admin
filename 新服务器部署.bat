@echo off
echo ========================================
echo   新服务器一键部署
echo ========================================
echo.
echo 使用方法：
echo 1. 先上传 english-backup.tar.gz 到新服务器
echo 2. 在新服务器上执行以下命令
echo.
echo ========================================
echo.

echo "请输入新服务器IP:"
set /p NEW_IP=

echo.
echo 上传备份文件到新服务器...
scp -o StrictHostKeyChecking=no english-backup.tar.gz root@%NEW_IP%:/root/

echo.
echo 在新服务器上执行部署...
ssh -o StrictHostKeyChecking=no root@%NEW_IP% "bash -s" << 'ENDSSH'
#!/bin/bash
set -e

echo "1. 解压备份..."
cd /root
tar -xzvf english-backup.tar.gz

echo "2. 安装必要软件..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
    yum install -y nodejs
fi

if ! command -v nginx &> /dev/null; then
    yum install -y nginx
fi

npm install -g pm2 2>/dev/null || true

echo "3. 创建目录并恢复文件..."
mkdir -p /root/english-learning/my1
cp -r english-backup/backend /root/english-learning/my1/
cp -r english-backup/frontend /root/english-learning/my1/
cp english-backup/database.sqlite /root/english-learning/my1/backend/

echo "4. 安装后端依赖..."
cd /root/english-learning/my1/backend
npm install --production

echo "5. 安装前端依赖并构建..."
cd /root/english-learning/my1/frontend
npm install
npm run build

echo "6. 配置 Nginx..."
mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled
cp /root/english-backup/nginx.conf /etc/nginx/sites-available/english-learning
ln -sf /etc/nginx/sites-available/english-learning /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
systemctl enable nginx
nginx -t && systemctl restart nginx

echo "7. 启动后端服务..."
pm2 start /root/english-learning/my1/backend/src/index.js --name english-backend
pm2 save
pm2 startup | bash

echo "8. 清理临时文件..."
rm -rf /root/english-backup /root/english-backup.tar.gz

echo ""
echo "========================================"
echo "部署完成！"
echo "网站地址: http://$(curl -s ifconfig.me)"
echo "========================================"
ENDSSH

echo.
pause
