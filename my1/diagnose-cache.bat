@echo off
chcp 65001 >nul
echo ========================================
echo 音频缓存诊断工具
echo ========================================
echo.

cd backend

echo [1/4] 检查数据库中的缓存记录...
node check-audio-cache-correct.js
echo.

echo [2/4] 检查音频文件...
if exist "audio-cache" (
    echo ✓ audio-cache 目录存在
    dir /b audio-cache\*.mp3 2>nul | find /c ".mp3" > temp.txt
    set /p count=<temp.txt
    del temp.txt
    echo   找到 %count% 个音频文件
) else (
    echo ✗ audio-cache 目录不存在
)
echo.

echo [3/4] 检查后端服务状态...
curl -s http://localhost:3000/api/health >nul 2>&1
if %errorlevel%==0 (
    echo ✓ 后端服务正在运行 (端口 3000)
) else (
    echo ✗ 后端服务未运行
    echo   请运行: start-all.bat
)
echo.

echo [4/4] 测试缓存 API (需要管理员登录)...
echo 提示: 如果 API 测试失败，请确保:
echo   1. 已使用管理员账号登录前端
echo   2. 浏览器 Cookie 正常工作
echo.

cd ..

echo ========================================
echo 诊断完成
echo ========================================
echo.
echo 如果发现问题，请查看上面的错误信息
echo.

pause
