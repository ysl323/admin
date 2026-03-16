@echo off
chcp 65001 >nul
title 修复首页500错误
cls

echo ========================================
echo 修复首页500错误 - 自动执行
echo ========================================
echo.
echo 正在连接服务器并执行修复...
echo 请勿关闭窗口...
echo.

cd /d e:\demo\my1

echo [1/7] 检查PM2状态...
ssh root@47.97.185.117 "pm2 list"
echo.

echo [2/7] 检查后端日志...
ssh root@47.97.185.117 "pm2 logs my1-backend --lines 20 --nostream"
echo.

echo [3/7] 检查Nginx状态...
ssh root@47.97.185.117 "systemctl status nginx | head -10"
echo.

echo [4/7] 检查端口...
ssh root@47.97.185.117 "netstat -tlnp | grep -E ':(3000|80) ' || echo Ports not found"
echo.

echo [5/7] 检查前端文件...
ssh root@47.97.185.117 "ls -lh /var/www/html/learning/index.html 2>/dev/null || echo Frontend not found"
echo.

echo [6/7] 执行修复...
ssh root@47.97.185.117 "cd /root/my1-english-learning/backend && pm2 restart my1-backend && pm2 save"
ssh root@47.97.185.117 "systemctl start nginx && systemctl reload nginx"
echo.

echo [7/7] 等待服务启动...
timeout /t 3 /nobreak >nul

echo.
echo 最终状态:
ssh root@47.97.185.117 "pm2 list | grep my1-backend"
echo.

echo ========================================
echo 修复完成！
echo ========================================
echo.
echo 请访问测试:
echo   首页: http://47.97.185.117
echo   后台: http://47.97.185.117/admin
echo.
echo 按任意键退出...
pause >nul
