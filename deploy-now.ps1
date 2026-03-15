# 立即部署脚本

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "导出功能自动部署" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否在正确的目录
$CurrentPath = Get-Location
Write-Host "当前目录: $CurrentPath" -ForegroundColor Gray
Write-Host ""

# 检查文件是否存在
$FilesToCheck = @(
    "e:\demo\my1\my1\frontend\dist\index.html",
    "e:\demo\my1\my1\backend\src\services\AdminService.js",
    "e:\demo\my1\my1\backend\src\routes\admin.js"
)

Write-Host "检查文件..." -ForegroundColor Yellow
foreach ($file in $FilesToCheck) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        Write-Host "  ✓ $file ($size bytes)" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file (文件不存在)" -ForegroundColor Red
    }
}
Write-Host ""

# 创建压缩包
Write-Host "创建部署包..." -ForegroundColor Yellow
$ZipPath = "e:\demo\my1\deploy-package.zip"
if (Test-Path $ZipPath) {
    Remove-Item $ZipPath -Force
}

# 使用 PowerShell 5.1+ 的 Compress-Archive
try {
    Compress-Archive -Path "e:\demo\my1\my1\frontend\dist\*" -DestinationPath "e:\demo\my1\frontend-dist.zip" -Force
    Compress-Archive -Path "e:\demo\my1\my1\backend\src\services\AdminService.js", "e:\demo\my1\my1\backend\src\routes\admin.js" -DestinationPath "e:\demo\my1\backend-src.zip" -Force

    Write-Host "  ✓ 前端压缩包: e:\demo\my1\frontend-dist.zip" -ForegroundColor Green
    Write-Host "  ✓ 后端压缩包: e:\demo\my1\backend-src.zip" -ForegroundColor Green
} catch {
    Write-Host "  ✗ 压缩失败: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "部署准备完成" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "请使用以下两种方式之一完成部署:" -ForegroundColor Yellow
Write-Host ""
Write-Host "方式 1: 使用 WinSCP (最简单)" -ForegroundColor White
Write-Host "  1. 下载 WinSCP: https://winscp.net/eng/download.php" -ForegroundColor Gray
Write-Host "  2. 连接到 47.97.185.117 (用户: root, 密码: MyEnglish2025!)" -ForegroundColor Gray
Write-Host "  3. 上传 e:\demo\my1\frontend\dist\* 到 /var/www/html/learning/" -ForegroundColor Gray
Write-Host "  4. 上传 e:\demo\my1\my1\backend\src\services\AdminService.js 到 /root/english-learning/backend/src/services/" -ForegroundColor Gray
Write-Host "  5. 上传 e:\demo\my1\my1\backend\src\routes\admin.js 到 /root/english-learning/backend/src/routes/" -ForegroundColor Gray
Write-Host "  6. 在 WinSCP 终端执行:" -ForegroundColor Gray
Write-Host "     cd /root/english-learning/backend && pm2 restart english-learning-backend" -ForegroundColor Yellow
Write-Host ""
Write-Host "方式 2: 使用 FileZilla" -ForegroundColor White
Write-Host "  1. 下载 FileZilla: https://filezilla-project.org/download.php" -ForegroundColor Gray
Write-Host "  2. 连接到 47.97.185.117 (用户: root, 密码: MyEnglish2025!)" -ForegroundColor Gray
Write-Host "  3. 上传文件 (与方式1相同)" -ForegroundColor Gray
Write-Host "  4. 使用 SSH 连接: ssh root@47.97.185.117" -ForegroundColor Gray
Write-Host "  5. 执行: cd /root/english-learning/backend && pm2 restart english-learning-backend" -ForegroundColor Yellow
Write-Host ""
Write-Host "部署后验证:" -ForegroundColor Cyan
Write-Host "  1. 访问 http://47.97.185.117/admin" -ForegroundColor Gray
Write-Host "  2. 进入'内容管理'" -ForegroundColor Gray
Write-Host "  3. 检查是否有'一键导出课程'按钮" -ForegroundColor Gray
Write-Host "  4. 测试导出功能" -ForegroundColor Gray
Write-Host ""
Write-Host "详细说明请查看: e:\demo\my1\手动部署指南-导出功能.md" -ForegroundColor Yellow
