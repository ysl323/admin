@echo off
echo ========================================
echo 诊断服务状态
echo ========================================
echo.

echo 检查后端服务 (端口3000)...
curl -s http://localhost:3000/api/learning/categories >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 后端服务正常运行
) else (
    echo ❌ 后端服务未运行或无法访问
    echo.
    echo 启动后端服务:
    echo   cd backend
    echo   npm start
)

echo.
echo 检查前端服务 (端口5173)...
curl -s http://localhost:5173 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 前端服务正常运行
) else (
    echo ❌ 前端服务未运行或无法访问
    echo.
    echo 启动前端服务:
    echo   cd frontend
    echo   npm run dev
)

echo.
echo ========================================
echo 诊断完成
echo ========================================
echo.

pause
