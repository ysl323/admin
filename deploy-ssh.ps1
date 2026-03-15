# 使用 PowerShell SSH 部署更新
$Server = "47.97.185.117"
$User = "root"
$Password = "MyEnglish2025!"

Write-Host "开始部署..." -ForegroundColor Green

# 使用 sshpass 或 plink (如果有)
# Windows 10+ 自带 ssh
$SSHCommand = "ssh -o StrictHostKeyChecking=no $User@$Server"

# 检查 plink 是否可用
$PlinkPath = "C:\Program Files\PuTTY\plink.exe"
if (Test-Path $PlinkPath) {
    Write-Host "使用 Plink 连接..." -ForegroundColor Yellow
    & $PlinkPath -pw $Password -batch $User@$Server @"
cd /root/english-learning && pwd
cd /root/english-learning/backend && pm2 restart english-learning-backend
pm2 status
rm -rf /var/cache/nginx/*
systemctl reload nginx
echo "Backend restarted successfully"
"@
} else {
    Write-Host "SSH Plink 不可用,请手动部署" -ForegroundColor Red
    Write-Host ""
    Write-Host "手动部署步骤:" -ForegroundColor Cyan
    Write-Host "1. 下载 FileZilla 或 WinSCP" -ForegroundColor White
    Write-Host "2. 连接到 $Server" -ForegroundColor White
    Write-Host "3. 上传以下文件:" -ForegroundColor White
    Write-Host "   - e:\demo\my1\my1\frontend\dist\* 到 /var/www/html/learning/" -ForegroundColor White
    Write-Host "   - e:\demo\my1\my1\backend\src\services\AdminService.js 到 /root/english-learning/backend/src/services/" -ForegroundColor White
    Write-Host "   - e:\demo\my1\my1\backend\src\routes\admin.js 到 /root/english-learning/backend/src/routes/" -ForegroundColor White
    Write-Host ""
    Write-Host "4. SSH连接到服务器并执行:" -ForegroundColor White
    Write-Host "   cd /root/english-learning/backend && pm2 restart english-learning-backend" -ForegroundColor Yellow
    Write-Host "   pm2 status" -ForegroundColor Yellow
}
