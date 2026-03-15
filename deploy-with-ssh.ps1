# 使用PowerShell直接执行SSH命令
$ErrorActionPreference = "Stop"

$Server = "root@47.97.185.117"
$AppPath = "/root/my1-english-learning"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploying Export Feature" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 读取base64编码的脚本
$base64Script = Get-Content "e:\demo\my1\update-script.b64" -Raw

# 构建命令
$command = "cd $AppPath && mkdir -p backup-$(date +\%Y\%m\%d) && cp backend/src/services/AdminService.js backup-$(date +\%Y\%m\%d)/ 2>/dev/null && cp backend/src/routes/admin.js backup-$(date +\%Y\%m\%d)/ 2>/dev/null && echo '$base64Script' | base64 -d | bash && cd backend && pm2 restart my1-backend"

Write-Host "`nExecuting deployment command on server..." -ForegroundColor Yellow

# 使用Start-Process执行ssh，避免等待
$process = Start-Process -FilePath "ssh.exe" -ArgumentList $Server, $command -NoNewWindow -PassThru -Wait

if ($process.ExitCode -eq 0) {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Deployment Complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "`nVisit:" -ForegroundColor White
    Write-Host "  http://47.97.185.117/admin" -ForegroundColor Cyan
    Write-Host "`nLogin:" -ForegroundColor White
    Write-Host "  Username: admin" -ForegroundColor Cyan
    Write-Host "  Password: admin123" -ForegroundColor Cyan
    Write-Host "`nClick 'Content Management' then 'Export All Courses'" -ForegroundColor Yellow
} else {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Deployment Failed" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "`nPlease execute manually:" -ForegroundColor Yellow
    Write-Host "1. SSH: ssh root@47.97.185.117" -ForegroundColor White
    Write-Host "2. View: e:\demo\my1\SERVER-COMMANDS.md" -ForegroundColor White
}
