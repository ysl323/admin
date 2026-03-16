# 检查服务器状态

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "服务器状态检查" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 使用 SSH 连接检查
$Server = "47.97.185.117"
$User = "root"

Write-Host "检查 PM2 服务状态..." -ForegroundColor Yellow
$SSHCommand = "ssh $User@$Server 'pm2 status'"
Invoke-Expression $SSHCommand

Write-Host ""
Write-Host "检查后端日志..." -ForegroundColor Yellow
$SSHCommand = "ssh $User@$Server 'pm2 logs english-learning-backend --lines 30 --nostream'"
Invoke-Expression $SSHCommand

Write-Host ""
Write-Host "检查 Nginx 状态..." -ForegroundColor Yellow
$SSHCommand = "ssh $User@$Server 'systemctl status nginx'"
Invoke-Expression $SSHCommand

Write-Host ""
Write-Host "检查端口监听..." -ForegroundColor Yellow
$SSHCommand = "ssh $User@$Server 'netstat -tlnp | grep -E ''(3000|80)'''"
Invoke-Expression $SSHCommand

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "检查完成" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
