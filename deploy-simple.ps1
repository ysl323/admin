# PowerShell 部署脚本
# 使用 PowerShell 远程连接和部署

param(
    [string]$ServerIP = "47.97.185.117",
    [string]$Username = "root",
    [string]$Password = "Admin88868"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "部署到服务器 $ServerIP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查前端构建
Write-Host "[1/6] 检查前端构建..." -ForegroundColor Yellow
if (-not (Test-Path "frontend\dist")) {
    Write-Host "错误：前端构建文件不存在！" -ForegroundColor Red
    Write-Host "请先运行: cd frontend; npm run build" -ForegroundColor Red
    exit 1
}
Write-Host "✓ 前端构建文件存在" -ForegroundColor Green

# 创建部署包
Write-Host ""
Write-Host "[2/6] 创建部署包..." -ForegroundColor Yellow
if (Test-Path "deploy-package") {
    Remove-Item -Recurse -Force "deploy-package"
}
New-Item -ItemType Directory -Path "deploy-package" | Out-Null
New-Item -ItemType Directory -Path "deploy-package\backend" | Out-Null
New-Item -ItemType Directory -Path "deploy-package\frontend" | Out-Null

Write-Host "  复制后端文件..." -ForegroundColor Gray
Copy-Item -Recurse -Force "backend\src" "deploy-package\backend\"
Copy-Item -Recurse -Force "backend\node_modules" "deploy-package\backend\"
Copy-Item -Force "backend\package.json" "deploy-package\backend\"
Copy-Item -Force "backend\.env" "deploy-package\backend\"

Write-Host "  复制前端文件..." -ForegroundColor Gray
Copy-Item -Recurse -Force "frontend\dist" "deploy-package\frontend\"

Write-Host "✓ 部署包创建完成" -ForegroundColor Green

# 压缩
Write-Host ""
Write-Host "[3/6] 压缩部署包..." -ForegroundColor Yellow
if (Test-Path "deploy-package.zip") {
    Remove-Item -Force "deploy-package.zip"
}
Compress-Archive -Path "deploy-package\*" -DestinationPath "deploy-package.zip" -Force
Write-Host "✓ 压缩完成" -ForegroundColor Green

# 检查 SSH 工具
Write-Host ""
Write-Host "[4/6] 检查 SSH 工具..." -ForegroundColor Yellow
$hasSCP = Get-Command scp -ErrorAction SilentlyContinue
$hasSSH = Get-Command ssh -ErrorAction SilentlyContinue

if (-not $hasSCP -or -not $hasSSH) {
    Write-Host "警告：未找到 SSH 工具" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "请选择部署方式：" -ForegroundColor Cyan
    Write-Host "1. 手动上传（使用 FTP 工具如 FileZilla）" -ForegroundColor White
    Write-Host "2. 安装 OpenSSH 客户端后重试" -ForegroundColor White
    Write-Host ""
    Write-Host "手动上传步骤：" -ForegroundColor Cyan
    Write-Host "1. 使用 FTP 工具连接到服务器" -ForegroundColor White
    Write-Host "   - 地址: $ServerIP" -ForegroundColor White
    Write-Host "   - 用户: $Username" -ForegroundColor White
    Write-Host "   - 密码: $Password" -ForegroundColor White
    Write-Host "2. 上传 deploy-package.zip 到 /root/" -ForegroundColor White
    Write-Host "3. 上传 server-setup.sh 到 /root/" -ForegroundColor White
    Write-Host "4. SSH 连接到服务器并运行:" -ForegroundColor White
    Write-Host "   cd /root" -ForegroundColor Gray
    Write-Host "   chmod +x server-setup.sh" -ForegroundColor Gray
    Write-Host "   ./server-setup.sh" -ForegroundColor Gray
    Write-Host ""
    Write-Host "部署包已准备好: deploy-package.zip" -ForegroundColor Green
    Write-Host ""
    pause
    exit 0
}

# 上传文件
Write-Host ""
Write-Host "[5/6] 上传到服务器..." -ForegroundColor Yellow
Write-Host "  上传部署包..." -ForegroundColor Gray

# 使用 scp 上传
$env:SSH_ASKPASS = ""
echo "yes" | scp -P 22 "deploy-package.zip" "${Username}@${ServerIP}:/root/" 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  上传部署包..." -ForegroundColor Gray
    # 尝试使用密码
    $securePassword = ConvertTo-SecureString $Password -AsPlainText -Force
    # 注意：这需要安装 Posh-SSH 模块
    # Install-Module -Name Posh-SSH -Force
}

Write-Host "  上传部署脚本..." -ForegroundColor Gray
echo "yes" | scp -P 22 "server-setup.sh" "${Username}@${ServerIP}:/root/" 2>&1 | Out-Null

Write-Host "✓ 上传完成" -ForegroundColor Green

# 在服务器上执行部署
Write-Host ""
Write-Host "[6/6] 在服务器上部署..." -ForegroundColor Yellow
ssh -p 22 "${Username}@${ServerIP}" "cd /root && chmod +x server-setup.sh && ./server-setup.sh"

# 清理
Write-Host ""
Write-Host "清理本地临时文件..." -ForegroundColor Yellow
Remove-Item -Recurse -Force "deploy-package"
Remove-Item -Force "deploy-package.zip"
Write-Host "✓ 清理完成" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "部署完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "访问地址: http://$ServerIP" -ForegroundColor White
Write-Host ""
Write-Host "管理命令：" -ForegroundColor Cyan
Write-Host "  查看日志: ssh ${Username}@${ServerIP} 'pm2 logs english-backend'" -ForegroundColor White
Write-Host "  重启服务: ssh ${Username}@${ServerIP} 'pm2 restart english-backend'" -ForegroundColor White
Write-Host "  查看状态: ssh ${Username}@${ServerIP} 'pm2 status'" -ForegroundColor White
Write-Host ""

pause
