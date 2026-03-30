@echo off
echo ========================================
echo   修复 PM2 日志卡住问题
echo ========================================
echo.

echo 1. 拉取最新代码...
ssh -o StrictHostKeyChecking=no root@47.97.185.117 "cd /root/english-learning/pdf-admin && git pull origin master"

echo.
echo 2. 停止旧的 PM2 进程...
ssh -o StrictHostKeyChecking=no root@47.97.185.117 "cd /root/english-learning/pdf-admin && pm2 delete pdf-admin-api 2>/dev/null; pm2 delete all 2>/dev/null; true"

echo.
echo 3. 使用新配置启动 PM2...
ssh -o StrictHostKeyChecking=no root@47.97.185.117 "cd /root/english-learning/pdf-admin && pm2 start ecosystem.config.js"

echo.
echo 4. 保存 PM2 配置...
ssh -o StrictHostKeyChecking=no root@47.97.185.117 "pm2 save"

echo.
echo 5. 查看进程状态...
ssh -o StrictHostKeyChecking=no root@47.97.185.117 "pm2 list"

echo.
echo 6. 测试API...
powershell -Command "try { (Invoke-WebRequest -Uri 'http://47.97.185.117:3100/api/health' -UseBasicParsing -TimeoutSec 5).Content } catch { 'ERROR' }"

echo.
echo ========================================
echo 完成！现在使用 pm2 logs --raw 查看日志
echo 避免 --raw 参数就不会卡住了
echo ========================================
pause
