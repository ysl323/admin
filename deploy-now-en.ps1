# Deploy Export Feature - Double click to run
$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploying Export Feature..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$Server = "root@47.97.185.117"
$Base64File = "e:\demo\my1\update-script.b64"

if (-not (Test-Path $Base64File)) {
    Write-Host "ERROR: File not found: $Base64File" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

$base64Script = Get-Content $Base64File -Raw

Write-Host ""
Write-Host "Connecting to server and applying updates..." -ForegroundColor Yellow
Write-Host "This may take 1-2 minutes..." -ForegroundColor Gray

$sshCommand = "echo '$base64Script' | base64 -d | bash"

try {
    $output = ssh.exe $Server $sshCommand 2>&1
    $output | ForEach-Object { Write-Host $_ }

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "Deployment Complete!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Test the export feature:" -ForegroundColor White
        Write-Host "  http://47.97.185.117/admin" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Login:" -ForegroundColor White
        Write-Host "  Username: admin" -ForegroundColor Cyan
        Write-Host "  Password: admin123" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Steps:" -ForegroundColor White
        Write-Host "  1. Go to Content Management" -ForegroundColor Yellow
        Write-Host "  2. Click 'Export All Courses' button" -ForegroundColor Yellow
        Write-Host "  3. Wait for JSON file download" -ForegroundColor Yellow
    } else {
        Write-Host ""
        Write-Host "Deployment failed, exit code: $LASTEXITCODE" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please execute manually:" -ForegroundColor Yellow
        Write-Host "1. Open SSH terminal" -ForegroundColor White
        Write-Host "2. Connect: ssh root@47.97.185.117" -ForegroundColor White
        Write-Host "3. See: e:\demo\my1\SERVER-COMMANDS.md" -ForegroundColor White
    }
} catch {
    Write-Host ""
    Write-Host "Error during deployment:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Please deploy manually" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press Enter to exit..." -ForegroundColor Gray
Read-Host
