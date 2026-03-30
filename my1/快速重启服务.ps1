# 快速重启服务 - 解决500错误
param(
    [string]$ServerIP = "47.97.185.117"
)

$SERVER = "root@$ServerIP"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔄 快速重启服务" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    Write-Host "正在重启服务..." -ForegroundColor Yellow
    
    $RESTART_COMMANDS = @"
echo '🔄 重启服务中...' && \
pm2 restart english-learning-backend 2>/dev/null || \
(echo '服务不存在，重新启动...' && \
cd /root/english-learning/backend && \
pm2 start src/server.js --name english-learning-backend --node-args='--max-old-space-size=512') && \
echo '✓ 后端服务已重启' && \
echo '' && \
systemctl restart nginx && \
echo '✓ Nginx已重启' && \
echo '' && \
echo '服务状态:' && \
pm2 list && \
echo '' && \
echo '端口监听:' && \
netstat -tlnp | grep -E ':(80|443|3000)' && \
echo '' && \
echo '最新日志:' && \
pm2 logs english-learning-backend --lines 3 --nostream || true
"@

    ssh $SERVER $RESTART_COMMANDS
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ 服务重启完成！" -ForegroundColor Green
        Write-Host ""
        Write-Host "🌐 测试访问: http://$ServerIP" -ForegroundColor Cyan
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ 重启失败，建议执行紧急修复" -ForegroundColor Red
        Write-Host ""
    }

} catch {
    Write-Host ""
    Write-Host "❌ 连接失败: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

Write-Host "如果仍有问题，请运行:" -ForegroundColor Yellow
Write-Host "  .\紧急修复500错误.ps1" -ForegroundColor White
Write-Host ""