#!/bin/bash
# 快速修复脚本 - 首页500错误

set -e

echo "=========================================="
echo "快速修复首页500错误"
echo "=========================================="
echo ""

# 1. 检查并重启PM2
echo "[1/4] 检查并修复PM2服务..."
if pm2 list | grep -q "my1-backend.*stopped"; then
    echo "PM2服务已停止，正在重启..."
    cd /root/my1-english-learning/backend
    pm2 start my1-backend
    pm2 save
    echo "✓ PM2服务已重启"
elif pm2 list | grep -q "my1-backend.*errored"; then
    echo "PM2服务出错，正在重启..."
    cd /root/my1-english-learning/backend
    pm2 stop my1-backend
    pm2 delete my1-backend
    pm2 start index.js --name my1-backend
    pm2 save
    echo "✓ PM2服务已重启"
else
    echo "✓ PM2服务运行正常"
    pm2 restart my1-backend
fi
echo ""

# 2. 检查并重启Nginx
echo "[2/4] 检查并修复Nginx..."
if systemctl is-active --quiet nginx; then
    echo "✓ Nginx运行正常"
    systemctl reload nginx
else
    echo "Nginx未运行，正在启动..."
    systemctl start nginx
    echo "✓ Nginx已启动"
fi
echo ""

# 3. 检查数据库
echo "[3/4] 检查数据库..."
if [ -f "/root/my1-english-learning/backend/database.sqlite" ]; then
    echo "✓ 数据库文件存在"
    ls -lh /root/my1-english-learning/backend/database.sqlite
else
    echo "⚠ 数据库文件不存在，需要初始化"
fi
echo ""

# 4. 检查前端文件
echo "[4/4] 检查前端文件..."
if [ -f "/var/www/html/learning/index.html" ]; then
    echo "✓ 前端index.html存在"
else
    echo "⚠ 前端index.html不存在，需要重新部署"
fi
echo ""

echo "=========================================="
echo "修复完成！"
echo "=========================================="
echo ""
echo "请访问以下地址测试:"
echo "  - 首页: http://47.97.185.117"
echo "  - 管理后台: http://47.97.185.117/admin"
echo ""
echo "如果仍有问题，查看日志:"
echo "  pm2 logs my1-backend --lines 50"
echo "  tail -50 /var/log/nginx/error.log"
echo ""
