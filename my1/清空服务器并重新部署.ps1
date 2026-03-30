# 清空服务器并重新部署最新代码
# 服务器: 47.97.185.117
# 此脚本会完全清空服务器上的应用，然后部署本地最新代码

param(
    [switch]$SkipBuild,
    [switch]$KeepDatabase,
    [string]$ServerIP = "47.97.185.117"
)

$SERVER = "root@$ServerIP"
$SERVER_PATH = "/root/english-learning"

Write-Host "========================================" -ForegroundColor Red
Write-Host "⚠️  清空服务器并重新部署" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""
Write-Host "服务器: $ServerIP" -ForegroundColor Yellow
Write-Host "这将完全清空服务器上的应用并重新部署！" -ForegroundColor Red
Write-Host ""

# 确认操作
$confirmation = Read-Host "确认要继续吗？输入 'YES' 继续"
if ($confirmation -ne "YES") {
    Write-Host "操作已取消" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "开始部署流程..." -ForegroundColor Green
Write-Host ""

try {
    # 1. 构建前端（除非跳过）
    if (-not $SkipBuild) {
        Write-Host "步骤 1: 构建前端..." -ForegroundColor Yellow
        Push-Location frontend
        
        Write-Host "  清理旧构建..." -ForegroundColor Gray
        if (Test-Path "dist") {
            Remove-Item -Recurse -Force "dist"
        }
        
        Write-Host "  安装依赖..." -ForegroundColor Gray
        npm install
        if ($LASTEXITCODE -ne 0) {
            throw "前端依赖安装失败！"
        }
        
        Write-Host "  构建生产版本..." -ForegroundColor Gray
        npm run build
        if ($LASTEXITCODE -ne 0) {
            throw "前端构建失败！"
        }
        
        Pop-Location
        Write-Host "✓ 前端构建完成！" -ForegroundColor Green
    } else {
        Write-Host "步骤 1: 跳过前端构建" -ForegroundColor Yellow
    }
    Write-Host ""

    # 2. 创建部署包
    Write-Host "步骤 2: 创建部署包..." -ForegroundColor Yellow
    $TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
    $DEPLOY_DIR = "deploy-full-$TIMESTAMP"

    # 创建临时目录结构
    Write-Host "  创建目录结构..." -ForegroundColor Gray
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

    # 复制环境配置
    Write-Host "  复制环境配置..." -ForegroundColor Gray
    if (Test-Path ".env") {
        Copy-Item -Path ".env" -Destination "$DEPLOY_DIR/"
    }
    if (Test-Path ".env.example") {
        Copy-Item -Path ".env.example" -Destination "$DEPLOY_DIR/"
    }

    # 复制前端构建文件
    Write-Host "  复制前端构建文件..." -ForegroundColor Gray
    if (Test-Path "frontend/dist") {
        Copy-Item -Path "frontend/dist" -Destination "$DEPLOY_DIR/frontend/" -Recurse
    } else {
        throw "前端构建文件不存在！请先运行构建或使用 -SkipBuild 参数"
    }

    # 复制配置文件
    Write-Host "  复制配置文件..." -ForegroundColor Gray
    if (Test-Path "nginx-english-learning.conf") {
        Copy-Item -Path "nginx-english-learning.conf" -Destination "$DEPLOY_DIR/"
    }

    # 复制数据库（如果存在）
    if (Test-Path "database.sqlite") {
        Write-Host "  复制本地数据库..." -ForegroundColor Gray
        Copy-Item -Path "database.sqlite" -Destination "$DEPLOY_DIR/"
    }

    Write-Host "✓ 部署包创建完成！" -ForegroundColor Green
    Write-Host ""

    # 3. 压缩部署包
    Write-Host "步骤 3: 压缩部署包..." -ForegroundColor Yellow
    $ZIP_FILE = "$DEPLOY_DIR.zip"
    Compress-Archive -Path $DEPLOY_DIR -DestinationPath $ZIP_FILE -Force
    Write-Host "✓ 压缩完成: $ZIP_FILE" -ForegroundColor Green
    Write-Host ""

    # 4. 上传到服务器
    Write-Host "步骤 4: 上传到服务器..." -ForegroundColor Yellow
    Write-Host "  正在上传 $ZIP_FILE ..." -ForegroundColor Gray
    scp $ZIP_FILE "${SERVER}:/root/"
    if ($LASTEXITCODE -ne 0) {
        throw "文件上传失败！"
    }
    Write-Host "✓ 上传完成！" -ForegroundColor Green
    Write-Host ""

    # 5. 在服务器上执行完全清空和重新部署
    Write-Host "步骤 5: 服务器端部署..." -ForegroundColor Yellow
    Write-Host ""

    # 构建远程执行命令
    $DATABASE_BACKUP_CMD = if ($KeepDatabase) {
        "if [ -f /root/english-learning/backend/database.sqlite ]; then cp /root/english-learning/backend/database.sqlite /root/database-backup-`$(date +%Y%m%d_%H%M%S).sqlite && echo '✓ 数据库已备份'; fi"
    } else {
        "echo '⚠️  跳过数据库备份（将使用新数据库）'"
    }

    $DATABASE_RESTORE_CMD = if ($KeepDatabase) {
        "LATEST_BACKUP=`$(ls -t /root/database-backup-*.sqlite 2>/dev/null | head -1) && if [ -n \"`$LATEST_BACKUP\" ]; then cp \"`$LATEST_BACKUP\" /root/english-learning/backend/database.sqlite && echo '✓ 数据库已恢复'; else echo '⚠️  未找到数据库备份'; fi"
    } else {
        "if [ -f /root/english-learning/$DEPLOY_DIR/database.sqlite ]; then cp /root/english-learning/$DEPLOY_DIR/database.sqlite /root/english-learning/backend/ && echo '✓ 使用新数据库'; fi"
    }

    $REMOTE_COMMANDS = @"
set -e && \
echo '========================================' && \
echo '开始服务器端部署...' && \
echo '========================================' && \
echo '' && \
cd /root && \
echo '[1/10] 停止所有相关服务...' && \
pm2 stop english-learning-backend 2>/dev/null || true && \
pm2 delete english-learning-backend 2>/dev/null || true && \
echo '✓ 后端服务已停止' && \
echo '' && \
echo '[2/10] 备份数据库...' && \
$DATABASE_BACKUP_CMD && \
echo '' && \
echo '[3/10] 完全清空应用目录...' && \
rm -rf /root/english-learning && \
echo '✓ 应用目录已清空' && \
echo '' && \
echo '[4/10] 创建新的目录结构...' && \
mkdir -p /root/english-learning/backend && \
mkdir -p /root/english-learning/frontend && \
echo '✓ 目录结构已创建' && \
echo '' && \
echo '[5/10] 解压部署包...' && \
unzip -q -o $ZIP_FILE -d /root/english-learning/ && \
echo '✓ 部署包已解压' && \
echo '' && \
echo '[6/10] 整理文件结构...' && \
cd /root/english-learning/$DEPLOY_DIR && \
if [ -d backend ]; then cp -r backend/* ../backend/ && echo '  - 后端文件已复制'; fi && \
if [ -d frontend ]; then cp -r frontend/* ../frontend/ && echo '  - 前端文件已复制'; fi && \
if [ -f .env ]; then cp .env ../ && echo '  - 环境配置已复制'; fi && \
if [ -f .env.example ]; then cp .env.example ../ && echo '  - 环境配置示例已复制'; fi && \
if [ -f nginx-english-learning.conf ]; then cp nginx-english-learning.conf ../ && echo '  - Nginx配置已复制'; fi && \
cd /root/english-learning && \
rm -rf $DEPLOY_DIR && \
rm -f /root/$ZIP_FILE && \
echo '✓ 文件结构整理完成' && \
echo '' && \
echo '[7/10] 处理数据库...' && \
$DATABASE_RESTORE_CMD && \
echo '' && \
echo '[8/10] 安装后端依赖...' && \
cd /root/english-learning/backend && \
npm install --production --silent && \
echo '✓ 后端依赖安装完成' && \
echo '' && \
echo '[9/10] 更新 Nginx 配置...' && \
if [ -f /root/english-learning/nginx-english-learning.conf ]; then \
    cp /root/english-learning/nginx-english-learning.conf /etc/nginx/conf.d/ && \
    nginx -t && \
    nginx -s reload && \
    echo '✓ Nginx 配置已更新'; \
else \
    echo '⚠️  未找到 Nginx 配置文件'; \
fi && \
echo '' && \
echo '[10/10] 启动服务...' && \
pm2 start src/server.js --name english-learning-backend --node-args='--max-old-space-size=512' && \
pm2 save && \
echo '✓ 后端服务已启动' && \
echo '' && \
echo '========================================' && \
echo '✅ 部署完成！' && \
echo '========================================' && \
echo '' && \
echo '服务状态:' && \
pm2 list && \
echo '' && \
echo 'Nginx 状态:' && \
nginx -t && \
echo '' && \
echo '磁盘使用情况:' && \
df -h /root && \
echo ''
"@

    ssh $SERVER $REMOTE_COMMANDS
    if ($LASTEXITCODE -ne 0) {
        throw "服务器端部署失败！"
    }

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "🎉 部署成功完成！" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "访问信息:" -ForegroundColor Cyan
    Write-Host "  网站地址: http://$ServerIP" -ForegroundColor White
    Write-Host "  管理员账号: admin" -ForegroundColor White
    Write-Host "  管理员密码: admin123" -ForegroundColor White
    Write-Host ""
    Write-Host "部署详情:" -ForegroundColor Cyan
    Write-Host "  部署时间: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor White
    Write-Host "  部署包: $DEPLOY_DIR" -ForegroundColor White
    Write-Host "  数据库: $(if ($KeepDatabase) { '保留原有数据' } else { '使用新数据' })" -ForegroundColor White
    Write-Host ""

} catch {
    Write-Host ""
    Write-Host "❌ 部署失败: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    exit 1
} finally {
    # 清理本地临时文件
    Write-Host "清理本地临时文件..." -ForegroundColor Yellow
    if (Test-Path $DEPLOY_DIR) {
        Remove-Item -Recurse -Force $DEPLOY_DIR
    }
    if (Test-Path $ZIP_FILE) {
        Remove-Item -Force $ZIP_FILE
    }
    Write-Host "✓ 清理完成！" -ForegroundColor Green
}

Write-Host ""
Write-Host "建议接下来的操作:" -ForegroundColor Yellow
Write-Host "1. 访问网站确认功能正常" -ForegroundColor White
Write-Host "2. 测试登录和主要功能" -ForegroundColor White
Write-Host "3. 检查TTS语音功能" -ForegroundColor White
Write-Host "4. 验证数据导入导出功能" -ForegroundColor White
Write-Host ""