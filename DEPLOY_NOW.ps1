# 双击执行此脚本以部署导出功能
# 部署导出功能到服务器

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "正在部署导出功能..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 设置变量
$Server = "root@47.97.185.117"
$Base64File = "e:\demo\my1\update-script.b64"

# 检查文件是否存在
if (-not (Test-Path $Base64File)) {
    Write-Host "错误: 找不到文件 $Base64File" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
}

# 读取base64脚本
$base64Script = Get-Content $Base64File -Raw

Write-Host "`n正在连接服务器并执行更新..." -ForegroundColor Yellow
Write-Host "这可能需要1-2分钟，请稍候..." -ForegroundColor Gray

# 构建SSH命令
$sshCommand = @"
echo '$base64Script' | base64 -d | bash
"@

# 执行SSH命令
try {
    $output = ssh.exe $Server $sshCommand 2>&1
    $output | ForEach-Object { Write-Host $_ }

    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n========================================" -ForegroundColor Green
        Write-Host "部署成功完成！" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "`n请访问以下地址测试导出功能：" -ForegroundColor White
        Write-Host "  http://47.97.185.117/admin" -ForegroundColor Cyan
        Write-Host "`n登录信息：" -ForegroundColor White
        Write-Host "  用户名: admin" -ForegroundColor Cyan
        Write-Host "  密码: admin123" -ForegroundColor Cyan
        Write-Host "`n操作步骤：" -ForegroundColor White
        Write-Host "  1. 进入 内容管理" -ForegroundColor Yellow
        Write-Host "  2. 点击 '一键导出课程' 按钮" -ForegroundColor Yellow
        Write-Host "  3. 等待下载JSON文件" -ForegroundColor Yellow
    } else {
        Write-Host "`n部署失败，退出码: $LASTEXITCODE" -ForegroundColor Red
        Write-Host "`n请手动执行以下操作：" -ForegroundColor Yellow
        Write-Host "1. 打开SSH终端" -ForegroundColor White
        Write-Host "2. 连接: ssh root@47.97.185.117" -ForegroundColor White
        Write-Host "3. 查看: e:\demo\my1\SERVER-COMMANDS.md" -ForegroundColor White
    }
} catch {
    Write-Host "`n部署过程中出现错误:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "`n请手动执行部署" -ForegroundColor Yellow
}

Write-Host "`n按回车键退出..." -ForegroundColor Gray
Read-Host
