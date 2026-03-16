@echo off
echo ========================================
echo   恢复网站
echo ========================================
echo.

echo 1. 查看备份列表...
ssh -o StrictHostKeyChecking=no root@47.97.185.117 "ls -t /root/backup/"

echo.
echo 2. 恢复文件 (选择最新的备份)...
ssh -o StrictHostKeyChecking=no root@47.97.185.117 "cp -r /root/backup/dist-2026*/* /root/english-learning/frontend/dist/ 2>/dev/null && echo OK"

echo.
echo 3. 重启Nginx...
ssh -o StrictHostKeyChecking=no root@47.97.185.117 "nginx -s reload"

echo.
echo 4. 测试网站...
powershell -Command "try { (Invoke-WebRequest -Uri 'http://47.97.185.117/' -UseBasicParsing -TimeoutSec 5).StatusCode } catch { 'ERROR' }"

echo.
echo ========================================
echo 完成！请刷新浏览器
echo ========================================
pause
