@echo off
echo ========================================
echo 紧急修复 - 停止所有服务并重启
echo ========================================
echo.

echo 1. 停止所有 Node 进程...
taskkill /F /IM node.exe 2>nul

echo 2. 等待3秒...
timeout /t 3 /nobreak >nul

echo 3. 启动后端服务...
cd backend
start "Backend Server" cmd /k "npm start"

cd ..

echo 4. 等待5秒让后端启动...
timeout /t 5 /nobreak >nul

echo 5. 启动前端服务...
cd frontend
start "Frontend Server" cmd /k "npm run dev"

cd ..

echo.
echo ========================================
echo 服务已重启
echo ========================================
echo.
echo 后端: http://localhost:3000
echo 前端: http://localhost:5173
echo.
echo 请等待10秒让服务完全启动
echo 然后访问: http://localhost:5173
echo.
pause
