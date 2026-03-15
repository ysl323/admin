# 快速部署到服务器
$ErrorActionPreference = "Stop"

# 服务器配置
$ServerIP = "47.97.185.117"
$ServerUser = "root"
$ServerPath = "/root/my1-english-learning"
$FrontendDistPath = ".\my1\frontend\dist"
$BackendSrcPath = ".\my1\backend\src"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "开始部署到服务器 $ServerIP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. 检查前端构建
Write-Host "`n[1/5] 检查前端构建..." -ForegroundColor Yellow

if (-not (Test-Path $FrontendDistPath)) {
    Write-Host "x 前端dist目录不存在，请先运行: cd my1\frontend && npm run build" -ForegroundColor Red
    exit 1
}

Write-Host "v 前端构建文件存在" -ForegroundColor Green

# 2. 压缩前端
Write-Host "`n[2/5] 压缩前端文件..." -ForegroundColor Yellow

$FrontendZip = "frontend-dist.zip"
if (Test-Path $FrontendZip) {
    Remove-Item $FrontendZip -Force
}

Compress-Archive -Path "$FrontendDistPath\*" -DestinationPath $FrontendZip -Force

Write-Host "v 前端压缩完成" -ForegroundColor Green

# 3. 压缩后端源代码
Write-Host "`n[3/5] 压缩后端源代码..." -ForegroundColor Yellow

$BackendZip = "backend-src.zip"
if (Test-Path $BackendZip) {
    Remove-Item $BackendZip -Force
}

Compress-Archive -Path "$BackendSrcPath\*" -DestinationPath $BackendZip -Force

Write-Host "v 后端压缩完成" -ForegroundColor Green

# 4. 上传到服务器（需要scp工具）
Write-Host "`n[4/5] 上传文件到服务器..." -ForegroundColor Yellow

Write-Host "注意：如果没有安装scp工具，请手动上传以下文件到服务器：" -ForegroundColor Yellow
Write-Host "  - $FrontendZip -> $ServerIP:$ServerPath/frontend-dist.zip" -ForegroundColor Yellow
Write-Host "  - $BackendZip -> $ServerIP:$ServerPath/backend-src.zip" -ForegroundColor Yellow

# 尝试使用scp上传
try {
    scp $FrontendZip "${ServerUser}@${ServerIP}:${ServerPath}/frontend-dist.zip"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "v 前端文件上传成功" -ForegroundColor Green
    } else {
        Write-Host "! 上传失败，请手动上传文件" -ForegroundColor Yellow
    }
} catch {
    Write-Host "! 未安装scp工具或上传失败，请手动上传文件" -ForegroundColor Yellow
}

try {
    scp $BackendZip "${ServerUser}@${ServerIP}:${ServerPath}/backend-src.zip"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "v 后端文件上传成功" -ForegroundColor Green
    }
} catch {
    # 忽略
}

# 5. 提供服务器端部署命令
Write-Host "`n[5/5] 在服务器上执行以下命令：" -ForegroundColor Yellow
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "服务器端部署命令:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ssh root@$ServerIP" -ForegroundColor White
Write-Host "cd $ServerPath" -ForegroundColor White
Write-Host "mkdir -p public backend" -ForegroundColor White
Write-Host "unzip -o frontend-dist.zip -d public/" -ForegroundColor White
Write-Host "unzip -o backend-src.zip -d backend/" -ForegroundColor White
Write-Host "cd backend && npm install" -ForegroundColor White
Write-Host "pm2 restart my1-backend || pm2 start index.js --name my1-backend" -ForegroundColor White
Write-Host "pm2 save" -ForegroundColor White
Write-Host "`n========================================" -ForegroundColor Cyan

Write-Host "`n部署准备完成！" -ForegroundColor Green
Write-Host "访问地址: http://${ServerIP}" -ForegroundColor White
Write-Host "管理后台: http://${ServerIP}/admin" -ForegroundColor White
