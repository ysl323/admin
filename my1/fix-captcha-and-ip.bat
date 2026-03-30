@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║     验证码和IP记录功能修复                              ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo 修复内容:
echo   1. 后端返回用户IP字段 (registerIp, lastLoginIp)
echo   2. 验证码功能检查
echo   3. IP记录功能检查
echo.
echo ════════════════════════════════════════════════════════
echo.

echo [1/3] 检查后端服务器状态...
echo.
curl -s http://localhost:3000/api/auth/check >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 后端服务器未运行
    echo.
    echo 请先启动后端服务器:
    echo   cd my1
    echo   .\start-all.bat
    echo.
    pause
    exit /b 1
)
echo ✅ 后端服务器正在运行
echo.

echo [2/3] 重启后端服务器以应用修复...
echo.
echo 正在重启...
cd backend
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
start /B cmd /c "node src/server.js > server.log 2>&1"
timeout /t 3 /nobreak >nul
cd ..
echo ✅ 后端服务器已重启
echo.

echo [3/3] 运行测试验证修复...
echo.
cd backend
node test-captcha-and-ip.js
cd ..

echo.
echo ════════════════════════════════════════════════════════
echo.
echo 修复完成！
echo.
echo 下一步:
echo   1. 查看上面的测试结果
echo   2. 打开浏览器访问 http://localhost:5173
echo   3. 使用管理员账号登录 (admin/admin123)
echo   4. 进入"用户管理"查看IP显示
echo.
echo 详细信息请查看: CAPTCHA-AND-IP-FIX.md
echo.
pause
