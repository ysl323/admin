@echo off
chcp 65001 >nul
echo ========================================
echo 部署到服务器 47.97.185.117
echo ========================================
echo.

echo 步骤 1: 打包前端...
cd frontend
call npm run build
if errorlevel 1 (
    echo 前端构建失败！
    pause
    exit /b 1
)
cd ..
echo 前端构建完成！
echo.

echo 步骤 2: 创建部署包...
set TIMESTAMP=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set DEPLOY_DIR=deploy-%TIMESTAMP%

mkdir %DEPLOY_DIR%\backend\src
mkdir %DEPLOY_DIR%\frontend\dist

xcopy /E /I /Y backend\src %DEPLOY_DIR%\backend\src
copy /Y backend\package.json %DEPLOY_DIR%\backend\
if exist backend\package-lock.json copy /Y backend\package-lock.json %DEPLOY_DIR%\backend\
xcopy /E /I /Y frontend\dist %DEPLOY_DIR%\frontend\dist
if exist .env copy /Y .env %DEPLOY_DIR%\
if exist nginx-english-learning.conf copy /Y nginx-english-learning.conf %DEPLOY_DIR%\

echo 部署包创建完成！
echo.

echo 步骤 3: 压缩...
powershell -Command "Compress-Archive -Path '%DEPLOY_DIR%' -DestinationPath '%DEPLOY_DIR%.zip' -Force"
echo 压缩完成！
echo.

echo 步骤 4: 上传到服务器...
echo 密码: Admin88868
scp %DEPLOY_DIR%.zip root@47.97.185.117:/root/
if errorlevel 1 (
    echo 上传失败！
    pause
    exit /b 1
)
echo 上传完成！
echo.

echo 步骤 5: 在服务器上部署...
echo 密码: Admin88868
ssh root@47.97.185.117 "cd /root && bash -c 'set -e && echo 停止服务... && pm2 stop english-learning-backend 2>/dev/null || true && pm2 delete english-learning-backend 2>/dev/null || true && echo 备份数据库... && [ -f /root/english-learning/backend/database.sqlite ] && cp /root/english-learning/backend/database.sqlite /root/db-backup-$(date +%%Y%%m%%d_%%H%%M%%S).sqlite || true && echo 清空旧文件... && rm -rf /root/english-learning && mkdir -p /root/english-learning && echo 解压... && unzip -q -o %DEPLOY_DIR%.zip -d /root/english-learning/ && cd /root/english-learning/%DEPLOY_DIR% && mv backend /root/english-learning/ && mv frontend /root/english-learning/ && [ -f .env ] && mv .env /root/english-learning/ || true && [ -f nginx-english-learning.conf ] && mv nginx-english-learning.conf /root/english-learning/ || true && cd /root/english-learning && rm -rf %DEPLOY_DIR% && rm -f /root/%DEPLOY_DIR%.zip && LATEST_DB=$(ls -t /root/db-backup-*.sqlite 2>/dev/null | head -1) && [ -n \"$LATEST_DB\" ] && cp \"$LATEST_DB\" /root/english-learning/backend/database.sqlite || true && echo 安装依赖... && cd /root/english-learning/backend && npm install --production && [ -f /root/english-learning/nginx-english-learning.conf ] && cp /root/english-learning/nginx-english-learning.conf /etc/nginx/conf.d/ && nginx -t && nginx -s reload || true && echo 启动服务... && pm2 start src/server.js --name english-learning-backend && pm2 save && echo 部署完成！ && pm2 list'"

echo.
echo 步骤 6: 清理本地临时文件...
rmdir /S /Q %DEPLOY_DIR%
del /Q %DEPLOY_DIR%.zip
echo 清理完成！
echo.

echo ========================================
echo 部署成功！
echo ========================================
echo.
echo 访问地址: http://47.97.185.117
echo 管理员: admin / admin123
echo.
pause
