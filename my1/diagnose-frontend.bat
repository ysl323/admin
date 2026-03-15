@echo off
echo ========================================
echo 前端问题诊断工具
echo ========================================
echo.
echo 正在打开诊断页面...
echo.
echo 诊断页面将在浏览器中打开
echo 请按照页面上的指示进行诊断
echo.
echo 如果浏览器没有自动打开，请手动访问:
echo file:///%CD%\frontend-quick-check.html
echo.

start "" "%CD%\frontend-quick-check.html"

echo.
echo ========================================
echo 常见问题快速解决方案:
echo ========================================
echo.
echo 1. 如果显示"未登录"或"权限不足":
echo    - 访问 http://localhost:5173/login
echo    - 使用管理员账号登录: admin / admin123
echo.
echo 2. 如果 API 请求失败:
echo    - 确保后端服务正在运行
echo    - 运行: start-all.bat
echo.
echo 3. 如果数据显示为空:
echo    - 运行: fix-and-import-data.bat
echo    - 重新导入示例数据
echo.
echo 4. 如果浏览器缓存问题:
echo    - 按 Ctrl+Shift+Delete 清除缓存
echo    - 或在诊断页面点击"清除浏览器缓存"
echo.
echo ========================================
pause
