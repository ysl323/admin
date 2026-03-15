@echo off
chcp 65001 >nul
echo ========================================
echo 打开测试页面
echo ========================================
echo.
echo 正在打开浏览器...
echo.
echo 前端地址: http://localhost:5173
echo 后端地址: http://localhost:3000
echo.
echo 管理员账户:
echo   用户名: admin
echo   密码: admin123
echo.
echo 测试步骤请参考: test-all-features.md
echo.

start http://localhost:5173

echo.
echo 浏览器已打开！
echo.
pause
