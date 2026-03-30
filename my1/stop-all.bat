@echo off
chcp 65001 >nul
echo ========================================
echo 停止编程英语学习系统
echo ========================================
echo.

echo 正在查找并停止服务...
echo.

REM 停止后端服务（端口3000）
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo 停止后端服务 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

REM 停止前端服务（端口5173）
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
    echo 停止前端服务 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo ========================================
echo 所有服务已停止！
echo ========================================
echo.
pause
