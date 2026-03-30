@echo off
echo ========================================
echo 测试缓存导出功能
echo ========================================
echo.

echo 1. 检查后端服务状态...
curl -s http://localhost:3000/api/health >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 后端服务未运行！
    echo 请先运行: cd my1 ^&^& emergency-fix.bat
    pause
    exit /b 1
)
echo [成功] 后端服务正在运行
echo.

echo 2. 测试导出 API 端点...
echo 注意：需要先登录管理员账号
echo.
echo 请在浏览器中：
echo 1. 访问 http://localhost:5173
echo 2. 使用 admin/admin123 登录
echo 3. 进入缓存管理页面
echo 4. 点击"导出缓存"按钮
echo.
echo 如果导出失败，请检查：
echo - 后端服务是否已重启（必须重启才能加载新的 API 端点）
echo - 浏览器控制台的错误信息
echo - 是否已登录管理员账号
echo.

pause
