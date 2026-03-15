@echo off
chcp 65001 >nul
echo ========================================
echo 检查服务状态
echo ========================================
echo.

echo [1/2] 检查后端服务 (http://localhost:3000)...
curl -s http://localhost:3000/api/auth/check >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 后端服务运行正常
) else (
    echo ❌ 后端服务未运行
    echo    请运行: cd backend ^&^& npm start
)
echo.

echo [2/2] 检查前端服务 (http://localhost:5173)...
curl -s http://localhost:5173 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 前端服务运行正常
) else (
    echo ❌ 前端服务未运行
    echo    请运行: cd frontend ^&^& npm run dev
)
echo.

echo ========================================
echo 检查完成！
echo ========================================
echo.
echo 如果两个服务都正常，可以访问:
echo   前端: http://localhost:5173
echo   后端: http://localhost:3000
echo.
echo 管理员账户:
echo   用户名: admin
echo   密码: admin123
echo.
pause
