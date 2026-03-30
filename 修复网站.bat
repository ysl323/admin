@echo off
echo ========================================
echo   修复网站500错误
echo ========================================
echo.

echo 步骤1: 检查前端目录
ssh -o StrictHostKeyChecking=no root@47.97.185.117 "ls -la /root/english-learning/frontend/dist/ | head -10"

echo.
echo 步骤2: 检查Nginx配置
ssh -o StrictHostKeyChecking=no root@47.97.185.117 "cat /etc/nginx/conf.d/english-learning.conf 2>/dev/null | head -20"

echo.
echo 步骤3: 检查root目录
ssh -o StrictHostKeyChecking=no root@47.97.185.117 "ls -la /var/www/html/ 2>/dev/null"

echo.
echo ========================================
echo 修复完成，请刷新浏览器测试
pause
