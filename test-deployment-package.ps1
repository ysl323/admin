# 测试部署包完整性

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "测试部署包完整性" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$errors = 0

# 1. 检查部署包是否存在
Write-Host "[1/8] 检查部署包..." -ForegroundColor Yellow
if (Test-Path "deploy-package.zip") {
    $size = (Get-Item "deploy-package.zip").Length / 1MB
    Write-Host "✓ 部署包存在 (大小: $([math]::Round($size, 2)) MB)" -ForegroundColor Green
} else {
    Write-Host "✗ 部署包不存在" -ForegroundColor Red
    $errors++
}

# 2. 解压并检查内容
Write-Host ""
Write-Host "[2/8] 解压并检查内容..." -ForegroundColor Yellow
if (Test-Path "test-deploy") {
    Remove-Item -Recurse -Force "test-deploy"
}
Expand-Archive -Path "deploy-package.zip" -DestinationPath "test-deploy"

# 3. 检查后端文件
Write-Host ""
Write-Host "[3/8] 检查后端文件..." -ForegroundColor Yellow

$backendFiles = @(
    "test-deploy\backend\src\index.js",
    "test-deploy\backend\src\services\AdminService.js",
    "test-deploy\backend\src\services\AudioCacheService.js",
    "test-deploy\backend\src\services\TTSService.js",
    "test-deploy\backend\package.json",
    "test-deploy\backend\.env"
)

foreach ($file in $backendFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $($file.Replace('test-deploy\backend\', ''))" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $($file.Replace('test-deploy\backend\', '')) 缺失" -ForegroundColor Red
        $errors++
    }
}

# 4. 检查前端文件
Write-Host ""
Write-Host "[4/8] 检查前端文件..." -ForegroundColor Yellow

$frontendFiles = @(
    "test-deploy\frontend\dist\index.html",
    "test-deploy\frontend\dist\assets"
)

foreach ($file in $frontendFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $($file.Replace('test-deploy\frontend\dist\', ''))" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $($file.Replace('test-deploy\frontend\dist\', '')) 缺失" -ForegroundColor Red
        $errors++
    }
}

# 5. 检查修复的文件
Write-Host ""
Write-Host "[5/8] 检查修复的文件..." -ForegroundColor Yellow

# 检查 AdminService.js 是否包含修复
$adminService = Get-Content "test-deploy\backend\src\services\AdminService.js" -Raw
if ($adminService -match "required: false" -and $adminService -match "\?\." ) {
    Write-Host "  ✓ AdminService.js 包含 500 错误修复" -ForegroundColor Green
} else {
    Write-Host "  ✗ AdminService.js 可能缺少修复" -ForegroundColor Red
    $errors++
}

# 6. 检查环境配置
Write-Host ""
Write-Host "[6/8] 检查环境配置..." -ForegroundColor Yellow

$envContent = Get-Content "test-deploy\backend\.env" -Raw
$requiredEnvVars = @("NODE_ENV", "PORT", "DB_DIALECT", "CORS_ORIGIN")

foreach ($var in $requiredEnvVars) {
    if ($envContent -match $var) {
        Write-Host "  ✓ $var 已配置" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $var 未配置" -ForegroundColor Red
        $errors++
    }
}

# 7. 检查 node_modules
Write-Host ""
Write-Host "[7/8] 检查依赖..." -ForegroundColor Yellow

if (Test-Path "test-deploy\backend\node_modules") {
    $moduleCount = (Get-ChildItem "test-deploy\backend\node_modules" -Directory).Count
    Write-Host "  OK node_modules exists ($moduleCount modules)" -ForegroundColor Green
} else {
    Write-Host "  ERROR node_modules missing" -ForegroundColor Red
    $errors++
}

# 8. Statistics
Write-Host ""
Write-Host "[8/8] File size statistics..." -ForegroundColor Yellow

$backendSize = (Get-ChildItem "test-deploy\backend" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
$frontendSize = (Get-ChildItem "test-deploy\frontend" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB

Write-Host "  Backend size: $([math]::Round($backendSize, 2)) MB" -ForegroundColor Cyan
Write-Host "  Frontend size: $([math]::Round($frontendSize, 2)) MB" -ForegroundColor Cyan
Write-Host "  Total size: $([math]::Round($backendSize + $frontendSize, 2)) MB" -ForegroundColor Cyan

# Cleanup
Write-Host ""
Write-Host "Cleaning up test files..." -ForegroundColor Yellow
Remove-Item -Recurse -Force "test-deploy"

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($errors -eq 0) {
    Write-Host "OK Deployment package integrity check passed!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Deployment package is ready to upload to server." -ForegroundColor White
    exit 0
} else {
    Write-Host "ERROR Found $errors issues" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Please fix issues and recreate deployment package." -ForegroundColor White
    exit 1
}
