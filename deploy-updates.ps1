# 部署更新到服务器
$ErrorActionPreference = "Stop"

$ServerIP = "47.97.185.117"
$ServerUser = "root"
$ServerPath = "/root/my1-english-learning"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploying updates to $ServerIP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. 压缩前端
Write-Host "`n[1/4] Compressing frontend..." -ForegroundColor Yellow
$FrontendDist = "e:\demo\my1\my1\frontend\dist"
$FrontendZip = "frontend-dist.zip"

if (Test-Path $FrontendZip) { Remove-Item $FrontendZip -Force }
Compress-Archive -Path "$FrontendDist\*" -DestinationPath $FrontendZip -Force
Write-Host "Frontend compressed" -ForegroundColor Green

# 2. 压缩后端源代码
Write-Host "`n[2/4] Compressing backend source..." -ForegroundColor Yellow
$BackendSrc = "e:\demo\my1\my1\backend\src"
$BackendZip = "backend-src.zip"

if (Test-Path $BackendZip) { Remove-Item $BackendZip -Force }
Compress-Archive -Path "$BackendSrc\*" -DestinationPath $BackendZip -Force
Write-Host "Backend source compressed" -ForegroundColor Green

# 3. 上传文件
Write-Host "`n[3/4] Uploading files to server..." -ForegroundColor Yellow

try {
    scp.exe $FrontendZip "${ServerUser}@${ServerIP}:${ServerPath}/"
    Write-Host "Frontend uploaded" -ForegroundColor Green
} catch {
    Write-Host "Failed to upload frontend: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

try {
    scp.exe $BackendZip "${ServerUser}@${ServerIP}:${ServerPath}/"
    Write-Host "Backend uploaded" -ForegroundColor Green
} catch {
    Write-Host "Failed to upload backend: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 4. 在服务器上执行更新脚本
Write-Host "`n[4/4] Executing server update..." -ForegroundColor Yellow

# 将服务器更新脚本上传
Write-Host "Uploading server update script..." -ForegroundColor Yellow
scp.exe "e:\demo\my1\server-update.sh" "${ServerUser}@${ServerIP}:${ServerPath}/"

# 执行服务器更新
Write-Host "Running server update..." -ForegroundColor Yellow
ssh.exe "${ServerUser}@${ServerIP}" "cd ${ServerPath} && chmod +x server-update.sh && bash server-update.sh"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Deployment completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Frontend: http://${ServerIP}" -ForegroundColor White
Write-Host "Admin: http://${ServerIP}/admin" -ForegroundColor White
