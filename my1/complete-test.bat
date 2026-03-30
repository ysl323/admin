@echo off
chcp 65001 >nul
echo ========================================
echo 完整端到端测试脚本
echo ========================================
echo.

cd backend

echo [步骤 1/6] 检查数据库当前状态...
echo.
node check-data.js
echo.
pause

echo [步骤 2/6] 修复表结构...
echo.
node fix-lessons-table.js
echo.
pause

echo [步骤 3/6] 导入示例数据...
echo.
call import-sample-data.bat
echo.
pause

echo [步骤 4/6] 验证数据导入...
echo.
node check-data.js
echo.
pause

echo [步骤 5/6] 检查音频缓存...
echo.
node check-audio-cache-correct.js
echo.
pause

echo [步骤 6/6] 测试完成！
echo.
echo 现在请：
echo 1. 打开浏览器访问: http://localhost:5173/login
echo 2. 使用管理员账号登录: admin / admin123
echo 3. 访问分类页面: http://localhost:5173/categories
echo 4. 应该看到 Programming Basics (3个课程) 和 Web Development (2个课程)
echo 5. 点击任意课程，播放音频
echo 6. 访问缓存管理: http://localhost:5173/admin/cache
echo 7. 应该看到新的缓存记录
echo.

cd ..
pause
