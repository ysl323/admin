@echo off
chcp 65001 >nul
title 全部任务执行
color 0A
cls

echo ========================================
echo       全部任务 - 一键执行
echo ========================================
echo.
echo 本脚本将自动执行以下任务:
echo   1. 修复首页500错误
echo   2. 部署导出功能
echo   3. 验证所有功能
echo.
echo ========================================
echo.
echo 按任意键开始执行...
pause >nul
cls

echo.
echo ========================================
echo 任务 1/3: 修复首页500错误
echo ========================================
echo.
call e:\demo\my1\立即修复-首页500.bat

cls
echo.
echo ========================================
echo 任务 2/3: 部署导出功能
echo ========================================
echo.
call e:\demo\my1\deploy-export.bat

cls
echo.
echo ========================================
echo 任务 3/3: 验证所有功能
echo ========================================
echo.
echo Checking PM2 status...
ssh root@47.97.185.117 "pm2 list"
echo.

echo Checking backend logs...
ssh root@47.97.185.117 "pm2 logs my1-backend --lines 10 --nostream"
echo.

echo Checking Nginx...
ssh root@47.97.185.117 "systemctl status nginx | head -5"
echo.

cls
echo.
echo ========================================
echo       全部任务执行完成！
echo ========================================
echo.
echo 验证清单:
echo.
echo   [ ] 首页可以访问: http://47.97.185.117
echo   [ ] 后台可以访问: http://47.97.185.117/admin
echo   [ ] 可以登录 (admin / admin123)
echo   [ ] 导出功能可用 (内容管理页面)
echo.
echo ========================================
echo.
echo 请在浏览器中测试以上功能
echo.
echo 按任意键退出...
pause >nul
