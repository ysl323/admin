# 通过SSH直接在服务器上更新导出功能
$ServerUser = "root"
$ServerIP = "47.97.185.117"
$AppPath = "/root/my1-english-learning"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "通过SSH更新服务器导出功能" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 读取更新脚本
$updateScript = Get-Content "e:\demo\my1\server-side-update.sh" -Raw

# 使用SSH执行脚本
Write-Host "`n连接到服务器并执行更新..." -ForegroundColor Yellow

$sshCommand = @"
$updateScript
"@

try {
    $result = ssh.exe "${ServerUser}@${ServerIP}" $sshCommand 2>&1
    Write-Host $result

    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "更新完成！" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
} catch {
    Write-Host "`n更新失败: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n请手动执行以下步骤:" -ForegroundColor Yellow
    Write-Host "1. SSH连接到服务器: ssh root@47.97.185.117" -ForegroundColor White
    Write-Host "2. 上传并执行脚本: bash server-side-update.sh" -ForegroundColor White
}
