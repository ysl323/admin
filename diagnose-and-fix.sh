#!/bin/bash
# 首页500错误诊断和修复脚本

echo "=========================================="
echo "首页500错误诊断和修复"
echo "=========================================="
echo ""

# 1. 检查PM2状态
echo "[1/7] 检查PM2服务状态..."
pm2 list
echo ""

# 2. 检查后端日志
echo "[2/7] 检查后端日志..."
pm2 logs my1-backend --lines 50 --nostream
echo ""

# 3. 检查Nginx状态
echo "[3/7] 检查Nginx状态..."
systemctl status nginx | head -15
echo ""

# 4. 检查端口监听
echo "[4/7] 检查端口监听..."
netstat -tlnp | grep -E ':(3000|80) ' || echo "端口未监听"
echo ""

# 5. 检查Node进程
echo "[5/7] 检查Node进程..."
ps aux | grep node | grep -v grep || echo "无Node进程"
echo ""

# 6. 检查前端文件
echo "[6/7] 检查前端文件..."
if [ -d "/var/www/html/learning" ]; then
    ls -lh /var/www/html/learning/ | head -20
    echo ""
    if [ -f "/var/www/html/learning/index.html" ]; then
        echo "✓ index.html 存在"
        head -5 /var/www/html/learning/index.html
    else
        echo "✗ index.html 不存在"
    fi
else
    echo "✗ /var/www/html/learning 目录不存在"
fi
echo ""

# 7. 检查数据库
echo "[7/7] 检查数据库..."
if [ -f "/root/my1-english-learning/backend/database.sqlite" ]; then
    ls -lh /root/my1-english-learning/backend/database.sqlite
    echo "✓ 数据库文件存在"
else
    echo "✗ 数据库文件不存在"
fi
echo ""

# 根据诊断结果提供修复建议
echo "=========================================="
echo "诊断完成"
echo "=========================================="
echo ""
echo "修复建议:"
echo ""
echo "如果PM2服务停止，执行:"
echo "  pm2 start my1-backend"
echo "  pm2 save"
echo ""
echo "如果后端有错误日志，执行:"
echo "  cd /root/my1-english-learning/backend"
echo "  npm install"
echo "  pm2 restart my1-backend"
echo ""
echo "如果Nginx未运行，执行:"
echo "  systemctl start nginx"
echo "  systemctl reload nginx"
echo ""
echo "如果前端文件缺失，需要重新上传"
echo ""
