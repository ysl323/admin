@echo off
chcp 65001 >nul
title 紧急修复500内部服务器错误

echo.
echo ========================================
echo 🚨 紧急修复500内部服务器错误
echo ========================================
echo.
echo 服务器: 47.97.185.117
echo.

echo 步骤1: 检查服务器状态...
echo 密码: Admin88868
ssh root@47.97.185.117 "echo '========================================' && echo '🔍 服务器诊断报告' && echo '========================================' && echo '' && echo '📅 当前时间:' && date && echo '' && echo '🔧 PM2 服务状态:' && pm2 list && echo '' && echo '📝 最近的错误日志:' && if [ -f /root/.pm2/logs/english-learning-backend-error.log ]; then echo '=== 错误日志 ===' && tail -20 /root/.pm2/logs/english-learning-backend-error.log && echo ''; fi && echo '📝 最近的输出日志:' && if [ -f /root/.pm2/logs/english-learning-backend-out.log ]; then echo '=== 输出日志 ===' && tail -20 /root/.pm2/logs/english-learning-backend-out.log && echo ''; fi && echo '🌐 端口监听状态:' && netstat -tlnp | grep -E ':(80|443|3000)' && echo '' && echo '💾 磁盘使用情况:' && df -h /root && echo '' && echo '🧠 内存使用情况:' && free -h && echo '' && echo '📁 应用目录检查:' && if [ -d /root/english-learning ]; then echo '✅ 应用目录存在' && ls -la /root/english-learning/ && echo '' && if [ -f /root/english-learning/backend/database.sqlite ]; then echo '✅ 数据库文件存在' && ls -lh /root/english-learning/backend/database.sqlite; else echo '❌ 数据库文件不存在'; fi && echo '' && if [ -f /root/english-learning/backend/src/server.js ]; then echo '✅ 服务器文件存在'; else echo '❌ 服务器文件不存在'; fi; else echo '❌ 应用目录不存在'; fi && echo '' && echo '🔍 Nginx 状态:' && nginx -t && systemctl status nginx --no-pager -l | head -20 && echo '' && echo '========================================' && echo '诊断完成' && echo '========================================'"

echo.
echo 步骤2: 执行紧急修复...
echo 密码: Admin88868
ssh root@47.97.185.117 "bash -c 'set -e && echo \"========================================\" && echo \"🔧 开始紧急修复\" && echo \"========================================\" && echo \"\" && echo \"[1/8] 停止所有服务...\" && pm2 stop all 2>/dev/null || true && pm2 delete all 2>/dev/null || true && echo \"✓ 服务已停止\" && echo \"\" && echo \"[2/8] 检查应用目录...\" && if [ ! -d /root/english-learning ]; then echo \"❌ 应用目录不存在，需要重新部署\" && exit 1; fi && echo \"✓ 应用目录存在\" && echo \"\" && echo \"[3/8] 检查数据库...\" && cd /root/english-learning/backend && if [ ! -f database.sqlite ]; then echo \"⚠️  数据库不存在，创建新数据库...\" && touch database.sqlite && echo \"✓ 数据库文件已创建\"; else echo \"✓ 数据库文件存在\"; fi && echo \"\" && echo \"[4/8] 检查Node.js依赖...\" && if [ ! -d node_modules ]; then echo \"⚠️  依赖不存在，重新安装...\" && npm install --production --silent && echo \"✓ 依赖安装完成\"; else echo \"✓ 依赖已存在\"; fi && echo \"\" && echo \"[5/8] 检查环境配置...\" && cd /root/english-learning && if [ ! -f .env ]; then echo \"⚠️  环境配置不存在，创建默认配置...\" && cat > .env << \"EOF\" NODE_ENV=production PORT=3000 DB_PATH=./backend/database.sqlite SESSION_SECRET=your-secret-key-here VOLCENGINE_ACCESS_KEY=your-access-key VOLCENGINE_SECRET_KEY=your-secret-key VOLCENGINE_REGION=cn-north-1 EOF && echo \"✓ 环境配置已创建\"; else echo \"✓ 环境配置存在\"; fi && echo \"\" && echo \"[6/8] 重新启动后端服务...\" && cd /root/english-learning/backend && pm2 start src/server.js --name english-learning-backend --node-args=\"--max-old-space-size=512\" && sleep 3 && echo \"✓ 后端服务已启动\" && echo \"\" && echo \"[7/8] 检查服务状态...\" && pm2 list && echo \"\" && echo \"[8/8] 重启Nginx...\" && nginx -t && systemctl restart nginx && echo \"✓ Nginx已重启\" && echo \"\" && echo \"========================================\" && echo \"✅ 紧急修复完成\" && echo \"========================================\" && echo \"\" && echo \"🔍 最终状态检查:\" && pm2 list && echo \"\" && echo \"🌐 端口监听:\" && netstat -tlnp | grep -E \":(80|443|3000)\" && echo \"\" && echo \"📝 最新日志:\" && pm2 logs english-learning-backend --lines 5 --nostream || true'"

if errorlevel 1 (
    echo.
    echo ❌ 紧急修复失败，需要重新部署
    echo.
    echo 建议执行完整重新部署:
    echo   清空服务器并重新部署.bat
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ 紧急修复完成！
echo ========================================
echo.
echo 🌐 请测试访问:
echo   主页: http://47.97.185.117
echo   登录: http://47.97.185.117/login
echo.
echo 🔑 管理员账号:
echo   用户名: admin
echo   密码: admin123
echo.
echo 如果问题仍然存在，请:
echo 1. 等待2-3分钟让服务完全启动
echo 2. 清除浏览器缓存
echo 3. 尝试访问不同的页面
echo 4. 如果仍有问题，执行完整重新部署
echo.
pause