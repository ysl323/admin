@echo off
echo ========================================
echo    直接部署到服务器 - 跳过GitHub
echo ========================================
echo.

echo 正在上传修复脚本到服务器...
scp update-server-fix-login.sh root@47.97.185.117:/root/

if errorlevel 1 (
    echo [错误] 上传失败！请检查SSH连接
    pause
    exit /b 1
)

echo [成功] 脚本已上传
echo.

echo 正在执行服务器更新...
ssh root@47.97.185.117 "cd /root && chmod +x update-server-fix-login.sh && ./update-server-fix-login.sh"

echo.
echo ========================================
echo    部署完成！
echo ========================================
echo.
echo 访问网站: http://47.97.185.117
echo 登录账号: admin / admin123
echo.
pause
