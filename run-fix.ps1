# Server Fix Script
$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Server Fix Execution" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[Step 1] Testing SSH connection..." -ForegroundColor Yellow
$result = ssh -o ConnectTimeout=10 root@47.97.185.117 "echo 'Connected'"
if ($LASTEXITCODE -eq 0) {
    Write-Host "SSH connected" -ForegroundColor Green
}
Write-Host ""

Write-Host "[Step 2] Checking PM2 status..." -ForegroundColor Yellow
ssh root@47.97.185.117 "pm2 list"
Write-Host ""

Write-Host "[Step 3] Checking backend logs..." -ForegroundColor Yellow
ssh root@47.97.185.117 "pm2 logs my1-backend --lines 20 --nostream"
Write-Host ""

Write-Host "[Step 4] Checking Nginx status..." -ForegroundColor Yellow
ssh root@47.97.185.117 "systemctl status nginx | head -10"
Write-Host ""

Write-Host "[Step 5] Checking ports..." -ForegroundColor Yellow
ssh root@47.97.185.117 "netstat -tlnp | grep -E ':(3000|80) ' || echo Ports not listening"
Write-Host ""

Write-Host "[Step 6] Checking frontend files..." -ForegroundColor Yellow
ssh root@47.97.185.117 "ls -lh /var/www/html/learning/index.html 2>/dev/null || echo Frontend files not found"
Write-Host ""

Write-Host "[Step 7] Executing fixes..." -ForegroundColor Yellow
ssh root@47.97.185.117 "cd /root/my1-english-learning/backend && pm2 restart my1-backend && pm2 save"
ssh root@47.97.185.117 "systemctl start nginx && systemctl reload nginx"
Write-Host ""

Write-Host "Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "[Step 8] Final status check..." -ForegroundColor Yellow
ssh root@47.97.185.117 "pm2 list | grep my1-backend"
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fix Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test URLs:" -ForegroundColor Yellow
Write-Host "  - Home: http://47.97.185.117" -ForegroundColor White
Write-Host "  - Admin: http://47.97.185.117/admin" -ForegroundColor White
Write-Host ""
