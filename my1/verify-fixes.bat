@echo off
echo ========================================
echo 验证修复
echo ========================================
echo.

echo 步骤1: 检查后端服务是否运行
echo.
curl -s http://localhost:3000/api/learning/categories >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 后端服务正在运行
) else (
    echo ❌ 后端服务未运行
    echo.
    echo 请先启动后端服务:
    echo   cd backend
    echo   npm start
    echo.
    pause
    exit /b 1
)

echo.
echo 步骤2: 检查前端服务是否运行
echo.
curl -s http://localhost:5173 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 前端服务正在运行
) else (
    echo ❌ 前端服务未运行
    echo.
    echo 请先启动前端服务:
    echo   cd frontend
    echo   npm run dev
    echo.
    pause
    exit /b 1
)

echo.
echo 步骤3: 测试API端点
echo.
cd backend
node test-api-endpoints.js

echo.
echo ========================================
echo 验证完成
echo ========================================
echo.
echo 下一步:
echo 1. 打开浏览器访问: http://localhost:5173
echo 2. 登录系统
echo 3. 测试TTS播放功能
echo 4. 测试返回按钮功能
echo.

pause
