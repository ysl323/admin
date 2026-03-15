# 清空服务器并部署最新代码
# 服务器: 47.97.185.117

$SERVER = "root@47.97.185.117"
$SERVER_PATH = "/root/english-learning"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "清空服务器并部署最新代码" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. 构建前端
Write-Host "步骤 1: 构建前端..." -ForegroundColor Yellow
Push-Location frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "前端构建失败！" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location
Write-Host "前端构建完成！" -ForegroundColor Green
Write-Host ""

# 2. 创建部署包
Write-Host "步骤 2: 创建部署包..." -ForegroundColor Yellow
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$DEPLOY_DIR = "deploy-package-$TIMESTAMP"

# 创建临时目录
New-Item -ItemType Directory -Force -Path $DEPLOY_DIR | Out-Null
New-Item -ItemType Directory -Force -Path "$DEPLOY_DIR/backend" | Out-Null
New-Item -ItemType Directory -Force -Path "$DEPLOY_DIR/frontend" | Out-Null

# 复制后端文件
Write-Host "  复制后端文件..." -ForegroundColor Gray
Copy-Item -Path "backend/src" -Destination "$DEPLOY_DIR/backend/" -Recurse
Copy-Item -Path "backend/package.json" -Destination "$DEPLOY_DIR/backend/"
if (Test-Path "backend/package-lock.json") {
    Copy-Item -Path "backend/package-lock.json" -Destination "$DEPLOY_DIR/backend/"
}
if (Test-Path ".env") {
    Copy-Item -Path ".env" -Destination "$DEPLOY_DIR/"
}
if (Test-Path ".env.example") {
    Copy-Item -Path ".env.example" -Destination "$DEPLOY_DIR/"
}

# 复制前端构建文件
Write-Host "  复制前端构建文件..." -ForegroundColor Gray
Copy-Item -Path "frontend/dist" -Destination "$DEPLOY_DIR/frontend/" -Recurse

# 复制 nginx 配置
if (Test-Path "nginx-english-learning.conf") {
    Write-Host "  复制 nginx 配置..." -ForegroundColor Gray
    Copy-Item -Path "nginx-english-learning.conf" -Destination "$DEPLOY_DIR/"
}

Write-Host "部署包创建完成！" -ForegroundColor Green
Write-Host ""

# 3. 压缩部署包
Write-Host "步骤 3: 压缩部署包..." -ForegroundColor Yellow
$ZIP_FILE = "$DEPLOY_DIR.zip"
Compress-Archive -Path $DEPLOY_DIR -DestinationPath $ZIP_FILE -Force
Write-Host "压缩完成: $ZIP_FILE" -ForegroundColor Green
Write-Host ""

# 4. 上传到服务器
Write-Host "步骤 4: 上传到服务器..." -ForegroundColor Yellow
Write-Host "  使用 scp 上传文件..." -ForegroundColor Gray
scp $ZIP_FILE "${SERVER}:/root/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "上传失败！" -ForegroundColor Red
    exit 1
}
Write-Host "上传完成！" -ForegroundColor Green
Write-Host ""

# 5. 在服务器上执行部署
Write-Host "步骤 5: 在服务器上执行部署..." -ForegroundColor Yellow
Write-Host ""

# 创建远程执行脚本
$REMOTE_COMMANDS = @"
cd /root && \
echo '停止后端服务...' && \
pm2 stop english-learning-backend 2>/dev/null || true && \
pm2 delete english-learning-backend 2>/dev/null || true && \
echo '备份数据库...' && \
if [ -f /root/english-learning/backend/database.sqlite ]; then cp /root/english-learning/backend/database.sqlite /root/database-backup-`$(date +%Y%m%d_%H%M%S).sqlite; echo '数据库已备份'; fi && \
echo '清空旧文件...' && \
rm -rf /root/english-learning/* && \
echo '解压新文件...' && \
unzip -o $ZIP_FILE -d /root/english-learning/ && \
cd /root/english-learning/$DEPLOY_DIR && \
echo '移动文件...' && \
mv backend/* ../backend/ 2>/dev/null || true && \
mv frontend/* ../frontend/ 2>/dev/null || true && \
mv .env ../ 2>/dev/null || true && \
mv .env.example ../ 2>/dev/null || true && \
mv nginx-english-learning.conf ../ 2>/dev/null || true && \
cd /root/english-learning && \
rm -rf $DEPLOY_DIR && \
echo '恢复数据库...' && \
LATEST_BACKUP=`$(ls -t /root/database-backup-*.sqlite 2>/dev/null | head -1) && \
if [ -n \"`$LATEST_BACKUP\" ]; then cp \"`$LATEST_BACKUP\" /root/english-learning/backend/database.sqlite && echo '数据库已恢复'; fi && \
echo '安装后端依赖...' && \
cd /root/english-learning/backend && \
npm install --production && \
echo '更新 nginx 配置...' && \
if [ -f /root/english-learning/nginx-english-learning.conf ]; then cp /root/english-learning/nginx-english-learning.conf /etc/nginx/conf.d/ && nginx -t && nginx -s reload && echo 'Nginx 配置已更新'; fi && \
echo '启动后端服务...' && \
pm2 start src/server.js --name english-learning-backend --node-args='--max-old-space-size=512' && \
pm2 save && \
echo '' && \
echo '=========================================' && \
echo '部署完成！' && \
echo '=========================================' && \
echo '' && \
pm2 list
"@

ssh $SERVER $REMOTE_COMMANDS

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "部署完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "访问地址: http://47.97.185.117" -ForegroundColor Cyan
Write-Host "管理员账号: admin" -ForegroundColor Cyan
Write-Host "管理员密码: admin123" -ForegroundColor Cyan
Write-Host ""
Write-Host "清理本地临时文件..." -ForegroundColor Yellow
Remove-Item -Recurse -Force $DEPLOY_DIR
Remove-Item -Force $ZIP_FILE
Write-Host "清理完成！" -ForegroundColor Green
