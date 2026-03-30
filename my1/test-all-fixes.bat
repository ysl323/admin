@echo off
chcp 65001 >nul
echo ========================================
echo 测试所有修复
echo ========================================
echo.

echo 正在测试...
echo.

node backend/test-api-fixes.js

echo.
echo ========================================
echo 测试完成！
echo ========================================
echo.
echo 下一步:
echo 1. 打开浏览器访问: http://localhost:5173
echo 2. 登录系统 (admin / admin123)
echo 3. 测试前端功能
echo.
echo 详细测试指南请查看: QUICK-TEST-GUIDE.md
echo.
pause
