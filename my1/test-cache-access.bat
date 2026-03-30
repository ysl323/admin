@echo off
echo ========================================
echo 测试缓存管理页面访问
echo ========================================
echo.
echo 此脚本将帮助您诊断缓存管理页面显示为 0 的问题
echo.
echo 请按照以下步骤操作:
echo.
echo 1. 确保后端服务正在运行 (端口 3000)
echo 2. 确保前端服务正在运行 (端口 5173)
echo 3. 使用管理员账号登录
echo.
pause
echo.
echo ========================================
echo 步骤 1: 检查数据库中的缓存记录
echo ========================================
echo.

cd backend
node check-audio-cache-correct.js

echo.
echo ========================================
echo 步骤 2: 测试后端 API
echo ========================================
echo.
echo 正在测试缓存 API...
echo.

node test-cache-api-session.js

echo.
echo ========================================
echo 步骤 3: 前端访问说明
echo ========================================
echo.
echo 如果上面的测试都通过了,但前端仍然显示 0:
echo.
echo 1. 打开浏览器访问: http://localhost:5173/login
echo 2. 使用管理员账号登录:
echo    用户名: admin
echo    密码: admin123
echo.
echo 3. 登录后访问: http://localhost:5173/admin/cache
echo.
echo 4. 如果仍然显示 0,请按 F12 打开开发者工具:
echo    - 查看 Console 标签页的错误信息
echo    - 查看 Network 标签页的 API 请求
echo    - 特别关注 /api/audio-cache/statistics 和 /api/audio-cache/list
echo.
echo 5. 常见问题:
echo    - 401 错误: 未登录,需要重新登录
echo    - 403 错误: 不是管理员账号,需要使用 admin 账号
echo    - 200 但数据为空: 检查响应内容
echo.
echo ========================================
pause
