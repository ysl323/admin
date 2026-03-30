@echo off
echo ========================================
echo    一键部署到服务器
echo ========================================
echo.

echo [1/5] 上传修复脚本到服务器...
scp backend\fix-user-table.js root@47.97.185.117:/www/wwwroot/english-learning/backend/
scp backend\reset-admin-password.js root@47.97.185.117:/www/wwwroot/english-learning/backend/

echo.
echo [2/5] 执行表结构修复...
ssh root@47.97.185.117 "cd /www/wwwroot/english-learning/backend && node fix-user-table.js"

echo.
echo [3/5] 重置管理员密码...
ssh root@47.97.185.117 "cd /www/wwwroot/english-learning/backend && node reset-admin-password.js"

echo.
echo [4/5] 重启后端服务...
ssh root@47.97.185.117 "pm2 restart english-backend"

echo.
echo [5/5] 测试登录功能...
ssh root@47.97.185.117 "curl -X POST http://localhost:3000/api/auth/login -H 'Content-Type: application/json' -d '{\"username\":\"admin\",\"password\":\"admin123\"}'"

echo.
echo ========================================
echo    部署完成！
echo ========================================
echo.
echo 访问网站: http://47.97.185.117
echo 登录账号: admin / admin123
echo.
pause
