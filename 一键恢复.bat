@echo off
chcp 65001 >nul
echo ========================================
echo   网站恢复脚本
echo ========================================
echo.
echo 密码: Admin88868
echo.

echo 检查备份...
ssh -o StrictHostKeyChecking=no root@47.97.185.117 "ls -t /root/backup/"

echo.
echo 恢复文件...
ssh -o StrictHostKeyChecking=no root@47.97.185.117 "cp -r /root/backup/dist-2026*/* /root/english-learning/frontend/dist/ && nginx -s reload"

echo.
echo 恢复完成!
pause
