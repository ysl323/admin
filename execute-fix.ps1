# PowerShell脚本 - 执行服务器修复
# 设置超时并强制执行

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "开始执行服务器修复" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查SSH连接
Write-Host "[步骤1] 测试SSH连接..." -ForegroundColor Yellow
try {
    $result = ssh -o ConnectTimeout=10 root@47.97.185.117 "echo 'Connected'"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ SSH连接成功" -ForegroundColor Green
    } else {
        Write-Host "✗ SSH连接失败" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ SSH连接异常: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 检查PM2状态
Write-Host "[步骤2] 检查PM2服务状态..." -ForegroundColor Yellow
ssh root@47.97.185.117 "pm2 list"
Write-Host ""

# 检查后端日志
Write-Host "[步骤3] 检查后端日志..." -ForegroundColor Yellow
ssh root@47.97.185.117 "pm2 logs my1-backend --lines 20 --nostream"
Write-Host ""

# 检查Nginx状态
Write-Host "[步骤4] 检查Nginx状态..." -ForegroundColor Yellow
ssh root@47.97.185.117 "systemctl status nginx | head -10"
Write-Host ""

# 检查端口
Write-Host "[步骤5] 检查端口监听..." -ForegroundColor Yellow
ssh root@47.97.185.117 "netstat -tlnp | grep -E ':(3000|80) ' || echo 端口未监听"
Write-Host ""

# 检查前端文件
Write-Host "[步骤6] 检查前端文件..." -ForegroundColor Yellow
ssh root@47.97.185.117 "ls -lh /var/www/html/learning/index.html 2>/dev/null || echo 前端文件不存在"
Write-Host ""

# 执行修复
Write-Host "[步骤7] 执行修复操作..." -ForegroundColor Yellow

# 创建修复脚本
$fixScript = @'
#!/bin/bash
echo "开始修复..."

# 修复PM2
cd /root/my1-english-learning/backend
if pm2 list | grep -q "my1-backend.*stopped\|errored"; then
    pm2 stop my1-backend 2>/dev/null
    pm2 delete my1-backend 2>/dev/null
    pm2 start index.js --name my1-backend
fi
pm2 restart my1-backend
pm2 save

# 修复Nginx
systemctl start nginx 2>/dev/null
systemctl reload nginx

# 恢复前端（如果需要）
if [ ! -f "/var/www/html/learning/index.html" ]; then
    BACKUP=$(ls -td /var/www/html/learning-backup-* 2>/dev/null | head -1)
    if [ -n "$BACKUP" ]; then
        mkdir -p /var/www/html/learning
        cp -r "$BACKUP"/* /var/www/html/learning/
    fi
fi

echo "修复完成"
'@

# 上传并执行
$fixScript | ssh root@47.97.185.117 "cat > /tmp/fix.sh && chmod +x /tmp/fix.sh && /tmp/fix.sh"
Write-Host ""

# 等待服务启动
Write-Host "等待服务启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# 最终检查
Write-Host "[步骤8] 最终状态检查..." -ForegroundColor Yellow
ssh root@47.97.185.117 "pm2 list | grep my1-backend"
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "修复完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "请访问测试:" -ForegroundColor Yellow
Write-Host "  - 首页: http://47.97.185.117" -ForegroundColor White
Write-Host "  - 后台: http://47.97.185.117/admin" -ForegroundColor White
Write-Host ""
