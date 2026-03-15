# Simple deployment package verification

Write-Host "Verifying deployment package..." -ForegroundColor Cyan
Write-Host ""

$errors = 0

# Check if package exists
if (Test-Path "deploy-package.zip") {
    $size = (Get-Item "deploy-package.zip").Length / 1MB
    Write-Host "[OK] Package exists - Size: $([math]::Round($size, 2)) MB" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Package not found" -ForegroundColor Red
    exit 1
}

# Extract and check
Write-Host "Extracting package..." -ForegroundColor Yellow
if (Test-Path "test-deploy") {
    Remove-Item -Recurse -Force "test-deploy"
}
Expand-Archive -Path "deploy-package.zip" -DestinationPath "test-deploy"

# Check backend
Write-Host ""
Write-Host "Checking backend files..." -ForegroundColor Yellow
if (Test-Path "test-deploy\backend\src\index.js") {
    Write-Host "[OK] Backend source files" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Backend source missing" -ForegroundColor Red
    $errors++
}

if (Test-Path "test-deploy\backend\package.json") {
    Write-Host "[OK] Package.json" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Package.json missing" -ForegroundColor Red
    $errors++
}

if (Test-Path "test-deploy\backend\.env") {
    Write-Host "[OK] Environment config" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Environment config missing" -ForegroundColor Red
    $errors++
}

# Check frontend
Write-Host ""
Write-Host "Checking frontend files..." -ForegroundColor Yellow
if (Test-Path "test-deploy\frontend\dist\index.html") {
    Write-Host "[OK] Frontend dist files" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Frontend dist missing" -ForegroundColor Red
    $errors++
}

# Check fixes
Write-Host ""
Write-Host "Checking code fixes..." -ForegroundColor Yellow
$adminService = Get-Content "test-deploy\backend\src\services\AdminService.js" -Raw
if ($adminService -match "required: false") {
    Write-Host "[OK] AdminService fix present" -ForegroundColor Green
} else {
    Write-Host "[WARN] AdminService fix may be missing" -ForegroundColor Yellow
}

# Cleanup
Write-Host ""
Write-Host "Cleaning up..." -ForegroundColor Yellow
Remove-Item -Recurse -Force "test-deploy"

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($errors -eq 0) {
    Write-Host "Package verification PASSED" -ForegroundColor Green
    Write-Host "Ready to deploy to server" -ForegroundColor Green
} else {
    Write-Host "Package verification FAILED - $errors errors" -ForegroundColor Red
}
Write-Host "========================================" -ForegroundColor Cyan
