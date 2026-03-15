# 一键部署导出功能到服务器
$ErrorActionPreference = "Stop"

$Server = "root@47.97.185.117"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "一键部署导出功能" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 读取base64编码的脚本
$base64Script = Get-Content "e:\demo\my1\update-script.b64" -Raw

# 创建SSH命令
$sshCommand = @"
echo '$base64Script' | base64 -d | bash
"@

Write-Host "`n正在连接服务器并执行更新..." -ForegroundColor Yellow

try {
    $result = ssh.exe $Server $sshCommand 2>&1
    Write-Host $result

    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "部署完成！" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "`n访问地址:" -ForegroundColor White
    Write-Host "  - 前端: http://47.97.185.117" -ForegroundColor White
    Write-Host "  - 管理后台: http://47.97.185.117/admin" -ForegroundColor White
    Write-Host "`n测试导出:" -ForegroundColor White
    Write-Host "  1. 访问管理后台并登录" -ForegroundColor White
    Write-Host "  2. 进入内容管理" -ForegroundColor White
    Write-Host "  3. 点击 '一键导出课程'" -ForegroundColor White
} catch {
    Write-Host "`n部署失败: $($_.Exception.Message)" -ForegroundColor Red

    Write-Host "`n请手动执行以下步骤:" -ForegroundColor Yellow
    Write-Host "1. 打开SSH终端连接: ssh root@47.97.185.117" -ForegroundColor White
    Write-Host "2. 查看部署指南: e:\demo\my1\DEPLOYMENT-STATUS.md" -ForegroundColor White
    Write-Host "3. 或者复制以下命令到服务器执行:" -ForegroundColor White
    Write-Host "   echo '$base64Script' | base64 -d | bash" -ForegroundColor Cyan
}
