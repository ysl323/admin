@echo off
echo ========================================
echo 测试缓存管理修复
echo ========================================
echo.

echo 1. 检查数据库缓存记录...
cd backend
node check-audio-cache-correct.js
echo.

echo ========================================
echo 修复完成！
echo ========================================
echo.
echo 前端修复内容:
echo - 修复了 audioCache.js 中的数据返回问题
echo - 移除了多余的 .data 包装层
echo.
echo 请执行以下操作:
echo 1. 在浏览器中按 Ctrl+Shift+R 强制刷新页面
echo 2. 如果还是不行，清除浏览器缓存:
echo    - 按 Ctrl+Shift+Delete
echo    - 选择"缓存的图片和文件"
echo    - 点击"清除数据"
echo 3. 重新访问缓存管理页面
echo.
echo 缓存管理页面: http://localhost:5173/admin/cache
echo.
pause
