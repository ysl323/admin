@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo ⚠️  清空服务器并重新部署
echo ========================================
echo.
echo 服务器: 47.97.185.117
echo 这将完全清空服务器上的应用并重新部署！
echo.

set /p confirm="确认要继续吗？输入 YES 继续: "
if not "!confirm!"=="YES" (
    echo 操作已取消
    pause
    exit /b 0
)

echo.
echo 开始部署流程...
echo.

REM 1. 构建前端
echo 步骤 1: 构建前端...
cd frontend
echo   清理旧构建...
if exist dist rmdir /s /q dist

echo   安装依赖...
call npm install
if errorlevel 1 (
    echo 前端依赖安装失败！
    cd ..
    pause
    exit /b 1
)

echo   构建生产版本...
call npm run build
if errorlevel 1 (
    echo 前端构建失败！
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✓ 前端构建完成！
echo.

REM 2. 创建部署包
echo 步骤 2: 创建部署包...
for /f "tokens=1-4 delims=/ " %%a in ('date /t') do set mydate=%%d%%b%%c
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set mytime=%%a%%b
set mytime=%mytime: =0%
set TIMESTAMP=%mydate%_%mytime%
set DEPLOY_DIR=deploy-full-%TIMESTAMP%

echo   创建目录结构...
mkdir %DEPLOY_DIR%\backend 2>nul
mkdir %DEPLOY_DIR%\frontend 2>nul

echo   复制后端文件...
xcopy /E /I /Y backend\src %DEPLOY_DIR%\backend\src
copy /Y backend\package.json %DEPLOY_DIR%\backend\
if exist backend\package-lock.json copy /Y backend\package-lock.json %DEPLOY_DIR%\backend\

echo   复制环境配置...
if exist .env copy /Y .env %DEPLOY_DIR%\
if exist .env.example copy /Y .env.example %DEPLOY_DIR%\

echo   复制前端构建文件...
if not exist frontend\dist (
    echo 前端构建文件不存在！
    pause
    exit /b 1
)
xcopy /E /I /Y frontend\dist %DEPLOY_DIR%\frontend\dist

echo   复制配置文件...
if exist nginx-english-learning.conf copy /Y nginx-english-learning.conf %DEPLOY_DIR%\
if exist database.sqlite copy /Y database.sqlite %DEPLOY_DIR%\

echo ✓ 部署包创建完成！
echo.

REM 3. 压缩部署包
echo 步骤 3: 压缩部署包...
powershell -Command "Compress-Archive -Path '%DEPLOY_DIR%' -DestinationPath '%DEPLOY_DIR%.zip' -Force"
echo ✓ 压缩完成: %DEPLOY_DIR%.zip
echo.

REM 4. 上传到服务器
echo 步骤 4: 上传到服务器...
echo   正在上传 %DEPLOY_DIR%.zip ...
echo 密码: Admin88868
scp %DEPLOY_DIR%.zip root@47.97.185.117:/root/
if errorlevel 1 (
    echo 文件上传失败！
    pause
    exit /b 1
)
echo ✓ 上传完成！
echo.

REM 5. 在服务器上执行部署
echo 步骤 5: 服务器端部署...
echo.
echo 密码: Admin88868
ssh root@47.97.185.117 "cd /root && bash -c 'set -e && echo \"========================================\" && echo \"开始服务器端部署...\" && echo \"========================================\" && echo \"\" && echo \"[1/10] 停止所有相关服务...\" && pm2 stop english-learning-backend 2>/dev/null || true && pm2 delete english-learning-backend 2>/dev/null || true && echo \"✓ 后端服务已停止\" && echo \"\" && echo \"[2/10] 备份数据库...\" && if [ -f /root/english-learning/backend/database.sqlite ]; then cp /root/english-learning/backend/database.sqlite /root/database-backup-$(date +%%Y%%m%%d_%%H%%M%%S).sqlite && echo \"✓ 数据库已备份\"; fi && echo \"\" && echo \"[3/10] 完全清空应用目录...\" && rm -rf /root/english-learning && echo \"✓ 应用目录已清空\" && echo \"\" && echo \"[4/10] 创建新的目录结构...\" && mkdir -p /root/english-learning/backend && mkdir -p /root/english-learning/frontend && echo \"✓ 目录结构已创建\" && echo \"\" && echo \"[5/10] 解压部署包...\" && unzip -q -o %DEPLOY_DIR%.zip -d /root/english-learning/ && echo \"✓ 部署包已解压\" && echo \"\" && echo \"[6/10] 整理文件结构...\" && cd /root/english-learning/%DEPLOY_DIR% && if [ -d backend ]; then cp -r backend/* ../backend/ && echo \"  - 后端文件已复制\"; fi && if [ -d frontend ]; then cp -r frontend/* ../frontend/ && echo \"  - 前端文件已复制\"; fi && if [ -f .env ]; then cp .env ../ && echo \"  - 环境配置已复制\"; fi && if [ -f .env.example ]; then cp .env.example ../ && echo \"  - 环境配置示例已复制\"; fi && if [ -f nginx-english-learning.conf ]; then cp nginx-english-learning.conf ../ && echo \"  - Nginx配置已复制\"; fi && if [ -f database.sqlite ]; then cp database.sqlite ../backend/ && echo \"  - 数据库文件已复制\"; fi && cd /root/english-learning && rm -rf %DEPLOY_DIR% && rm -f /root/%DEPLOY_DIR%.zip && echo \"✓ 文件结构整理完成\" && echo \"\" && echo \"[7/10] 处理数据库...\" && if [ ! -f /root/english-learning/backend/database.sqlite ]; then LATEST_BACKUP=$(ls -t /root/database-backup-*.sqlite 2>/dev/null | head -1) && if [ -n \"$LATEST_BACKUP\" ]; then cp \"$LATEST_BACKUP\" /root/english-learning/backend/database.sqlite && echo \"✓ 数据库已恢复\"; else echo \"⚠️  未找到数据库文件\"; fi; else echo \"✓ 使用新数据库\"; fi && echo \"\" && echo \"[8/10] 安装后端依赖...\" && cd /root/english-learning/backend && npm install --production --silent && echo \"✓ 后端依赖安装完成\" && echo \"\" && echo \"[9/10] 更新 Nginx 配置...\" && if [ -f /root/english-learning/nginx-english-learning.conf ]; then cp /root/english-learning/nginx-english-learning.conf /etc/nginx/conf.d/ && nginx -t && nginx -s reload && echo \"✓ Nginx 配置已更新\"; else echo \"⚠️  未找到 Nginx 配置文件\"; fi && echo \"\" && echo \"[10/10] 启动服务...\" && pm2 start src/server.js --name english-learning-backend --node-args=\"--max-old-space-size=512\" && pm2 save && echo \"✓ 后端服务已启动\" && echo \"\" && echo \"========================================\" && echo \"✅ 部署完成！\" && echo \"========================================\" && echo \"\" && echo \"服务状态:\" && pm2 list && echo \"\" && echo \"Nginx 状态:\" && nginx -t && echo \"\" && echo \"磁盘使用情况:\" && df -h /root && echo \"\"'"

if errorlevel 1 (
    echo.
    echo ❌ 服务器端部署失败！
    pause
    exit /b 1
)

echo.
echo ========================================
echo 🎉 部署成功完成！
echo ========================================
echo.
echo 访问信息:
echo   网站地址: http://47.97.185.117
echo   管理员账号: admin
echo   管理员密码: admin123
echo.
echo 部署详情:
echo   部署时间: %date% %time%
echo   部署包: %DEPLOY_DIR%
echo   数据库: 保留原有数据（如果存在）
echo.

REM 清理本地临时文件
echo 清理本地临时文件...
if exist %DEPLOY_DIR% rmdir /s /q %DEPLOY_DIR%
if exist %DEPLOY_DIR%.zip del /q %DEPLOY_DIR%.zip
echo ✓ 清理完成！
echo.

echo 建议接下来的操作:
echo 1. 访问网站确认功能正常
echo 2. 测试登录和主要功能
echo 3. 检查TTS语音功能
echo 4. 验证数据导入导出功能
echo.
pause