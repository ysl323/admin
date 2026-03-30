@echo off
chcp 65001 >nul
echo ========================================
echo 部署到服务器 47.97.185.117
echo ========================================
echo.

echo [1/5] 检查构建文件...
if not exist "frontend\dist" (
    echo 错误：前端构建文件不存在！
    echo 请先运行: cd frontend ^&^& npm run build
    exit /b 1
)
echo ✓ 前端构建文件存在

echo.
echo [2/5] 创建部署包...
if exist "deploy-package" rmdir /s /q deploy-package
mkdir deploy-package
mkdir deploy-package\backend
mkdir deploy-package\frontend

echo 复制后端文件...
xcopy /E /I /Y backend\src deploy-package\backend\src >nul
xcopy /E /I /Y backend\node_modules deploy-package\backend\node_modules >nul
copy /Y backend\package.json deploy-package\backend\ >nul
copy /Y backend\.env deploy-package\backend\ >nul

echo 复制前端构建文件...
xcopy /E /I /Y frontend\dist deploy-package\frontend\dist >nul

echo ✓ 部署包创建完成

echo.
echo [3/5] 压缩部署包...
powershell -Command "Compress-Archive -Path deploy-package\* -DestinationPath deploy-package.zip -Force"
echo ✓ 压缩完成

echo.
echo [4/5] 上传到服务器...
echo 使用 SCP 上传文件到服务器...
scp -P 22 deploy-package.zip root@47.97.185.117:/root/
if errorlevel 1 (
    echo 错误：上传失败！
    echo 请检查：
    echo 1. 服务器地址是否正确
    echo 2. SSH 连接是否正常
    echo 3. 是否安装了 OpenSSH 客户端
    exit /b 1
)
echo ✓ 上传完成

echo.
echo [5/5] 在服务器上部署...
ssh -p 22 root@47.97.185.117 "cd /root && unzip -o deploy-package.zip -d /www/wwwroot/english-learning && cd /www/wwwroot/english-learning/backend && pm2 restart english-backend || pm2 start src/index.js --name english-backend && pm2 save"

echo.
echo ========================================
echo 部署完成！
echo ========================================
echo.
echo 访问地址: http://47.97.185.117
echo.
echo 清理本地临时文件...
rmdir /s /q deploy-package
del /q deploy-package.zip
echo ✓ 清理完成

pause
