# 快速部署脚本
# 使用说明：以管理员身份运行 PowerShell，然后执行：. .\快速部署.ps1

param(
    [string]$ServerIP = "47.97.185.117",
    [string]$Username = "root"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "编程英语学习系统 - 快速部署" -ForegroundColor Cyan
Write-Host "服务器: $ServerIP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查本地文件
Write-Host "[1/6] 检查本地文件..." -ForegroundColor Yellow
if (-not (Test-Path "frontend\dist")) {
    Write-Host "错误：前端构建文件不存在！" -ForegroundColor Red
    Write-Host "请先运行: cd frontend; npm run build" -ForegroundColor Red
    exit 1
}
Write-Host "✓ 前端构建文件存在" -ForegroundColor Green
Write-Host ""

# 创建部署包
Write-Host "[2/6] 创建部署包..." -ForegroundColor Yellow
if (Test-Path "deploy-quick") {
    Remove-Item -Recurse -Force "deploy-quick"
}
New-Item -ItemType Directory -Path "deploy-quick\backend" | Out-Null
New-Item -ItemType Directory -Path "deploy-quick\frontend" | Out-Null

Write-Host "  复制后端源码..." -ForegroundColor Gray
Copy-Item -Recurse -Force "backend\src" "deploy-quick\backend\"
Copy-Item -Force "backend\package.json" "deploy-quick\backend\"
Copy-Item -Force "backend\package-lock.json" "deploy-quick\backend\"
if (Test-Path "backend\.env") {
    Copy-Item -Force "backend\.env" "deploy-quick\backend\"
}

Write-Host "  复制前端文件..." -ForegroundColor Gray
Copy-Item -Recurse -Force "frontend\dist" "deploy-quick\frontend\"

Write-Host "✓ 部署包创建完成" -ForegroundColor Green
Write-Host ""

# 压缩部署包
Write-Host "[3/6] 压缩部署包..." -ForegroundColor Yellow
if (Test-Path "deploy-quick.zip") {
    Remove-Item -Force "deploy-quick.zip"
}
Compress-Archive -Path "deploy-quick\*" -DestinationPath "deploy-quick.zip" -Force
if (-not (Test-Path "deploy-quick.zip")) {
    Write-Host "错误：压缩失败！" -ForegroundColor Red
    exit 1
}
$size = (Get-Item "deploy-quick.zip").Length / 1MB
Write-Host "✓ 压缩完成，大小: $([math]::Round($size, 2)) MB" -ForegroundColor Green
Write-Host ""

# 检查SSH工具
Write-Host "[4/6] 检查SSH工具..." -ForegroundColor Yellow
$hasSCP = Get-Command scp -ErrorAction SilentlyContinue
if (-not $hasSCP) {
    Write-Host "错误：未找到SCP工具！" -ForegroundColor Red
    Write-Host "请安装OpenSSH客户端或使用手动上传" -ForegroundColor Red
    exit 1
}
Write-Host "✓ SSH工具已安装" -ForegroundColor Green
Write-Host ""

# 上传文件
Write-Host "[5/6] 上传到服务器..." -ForegroundColor Yellow
Write-Host "请输入SSH密码 (按回车继续)..." -ForegroundColor Gray
$upload = scp -P 22 deploy-quick.zip "${Username}@${ServerIP}:/root/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "错误：上传失败！" -ForegroundColor Red
    exit 1
}
Write-Host "✓ 上传完成" -ForegroundColor Green
Write-Host ""

# 在服务器上部署
Write-Host "[6/6] 在服务器上部署..." -ForegroundColor Yellow
Write-Host "请在服务器上执行以下命令：" -ForegroundColor Cyan
Write-Host ""
Write-Host "  ssh ${Username}@${ServerIP}" -ForegroundColor White
Write-Host "  cd /root" -ForegroundColor Gray
Write-Host "  pm2 stop english-learning-backend" -ForegroundColor Gray
Write-Host "  unzip -o deploy-quick.zip -d /root/english-learning/" -ForegroundColor Gray
Write-Host "  cd /root/english-learning/deploy-quick" -ForegroundColor Gray
Write-Host "  cp -r backend/* ../backend/" -ForegroundColor Gray
Write-Host "  cp -r frontend/* ../frontend/" -ForegroundColor Gray
Write-Host "  cd /root/english-learning/backend" -ForegroundColor Gray
Write-Host "  npm install --production" -ForegroundColor Gray
Write-Host "  pm2 start src/index.js --name english-learning-backend" -ForegroundColor Gray
Write-Host "  pm2 save" -ForegroundColor Gray
Write-Host ""

# 清理本地文件
Write-Host "清理本地临时文件..." -ForegroundColor Yellow
Remove-Item -Recurse -Force "deploy-quick" -ErrorAction SilentlyContinue
Write-Host "✓ 清理完成" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "部署准备完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "请按照上述步骤在服务器上执行命令" -ForegroundColor White
Write-Host "完成后访问: http://${ServerIP}" -ForegroundColor White
Write-Host ""
