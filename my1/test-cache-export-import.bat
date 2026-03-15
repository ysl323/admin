@echo off
echo ========================================
echo 测试音频缓存导出导入功能
echo ========================================
echo.

cd backend

echo 正在运行测试...
echo.

node test-cache-export-import.js

echo.
echo ========================================
echo 测试完成
echo ========================================
echo.

pause
