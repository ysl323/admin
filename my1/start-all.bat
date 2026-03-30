@echo off
chcp 65001 >nul
echo ========================================
echo 启动编程英语学习系统
echo ========================================
echo.

echo 正在启动后端服务...
start "后端服务" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul

echo 正在启动前端服务...
start "前端服务" cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo 服务启动完成！
echo ========================================
echo.
echo 后端服务: http://localhost:3000
echo 前端服务: http://localhost:5173
echo.
echo 请等待几秒钟让服务完全启动...
echo 然后在浏览器中访问: http://localhost:5173
echo.
echo 默认管理员账号:
echo   用户名: admin
echo   密码: admin123
echo.
echo 按任意键打开浏览器...
pause >nul

start http://localhost:5173

echo.
echo 提示: 关闭此窗口不会停止服务
echo 要停止服务，请关闭"后端服务"和"前端服务"窗口
echo.
