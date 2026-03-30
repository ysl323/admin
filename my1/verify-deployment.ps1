# Verify Deployment - Check server code

Write-Host "=== Verifying Multi-Word Input Fix Deployment ===" -ForegroundColor Cyan
Write-Host ""

$server = "47.97.185.117"
$user = "root"
$password = "Admin88868"

Write-Host "1. Checking files on server..." -ForegroundColor Yellow

$securePassword = ConvertTo-SecureString $password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential($user, $securePassword)

try {
    Write-Host "   Checking if file exists..." -ForegroundColor Gray
    $checkFile = Invoke-SSHCommand -ComputerName $server -Credential $credential -Command "ls -lh /root/english-learning/dist/assets/LearningPage-*.js 2>&1" -Force
    
    if ($checkFile.ExitStatus -eq 0) {
        Write-Host "   [OK] LearningPage.js file exists" -ForegroundColor Green
        Write-Host "   File info: $($checkFile.Output)" -ForegroundColor Gray
    } else {
        Write-Host "   [FAIL] LearningPage.js file not found!" -ForegroundColor Red
        exit 1
    }

    Write-Host ""
    Write-Host "2. Checking file modification time..." -ForegroundColor Yellow
    
    $fileTime = Invoke-SSHCommand -ComputerName $server -Credential $credential -Command "stat -c '%y' /root/english-learning/dist/assets/LearningPage-*.js" -Force
    Write-Host "   File modified: $($fileTime.Output)" -ForegroundColor Gray
    
    $today = Get-Date -Format "yyyy-MM-dd"
    if ($fileTime.Output -match $today) {
        Write-Host "   [OK] File was modified today" -ForegroundColor Green
    } else {
        Write-Host "   [WARN] File was not modified today" -ForegroundColor Yellow
    }

    Write-Host ""
    Write-Host "3. Checking Nginx status..." -ForegroundColor Yellow
    
    $nginxStatus = Invoke-SSHCommand -ComputerName $server -Credential $credential -Command "systemctl status nginx | grep Active" -Force
    
    if ($nginxStatus.Output -match "active \(running\)") {
        Write-Host "   [OK] Nginx is running" -ForegroundColor Green
    } else {
        Write-Host "   [FAIL] Nginx is not running!" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "4. Testing HTTP access..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri "http://$server" -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "   [OK] HTTP access successful (Status: 200)" -ForegroundColor Green
        }
    } catch {
        Write-Host "   [FAIL] HTTP access failed: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "5. Checking backend service..." -ForegroundColor Yellow
    
    $backendStatus = Invoke-SSHCommand -ComputerName $server -Credential $credential -Command "pm2 list | grep english-learning" -Force
    
    if ($backendStatus.Output -match "online") {
        Write-Host "   [OK] Backend service is running" -ForegroundColor Green
    } else {
        Write-Host "   [WARN] Backend service status abnormal" -ForegroundColor Yellow
        Write-Host "   Status: $($backendStatus.Output)" -ForegroundColor Gray
    }

    Write-Host ""
    Write-Host "=== Verification Complete ===" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Open browser: http://$server" -ForegroundColor White
    Write-Host "2. Login with: admin/admin123" -ForegroundColor White
    Write-Host "3. Open test page: verify-multi-word-fix.html" -ForegroundColor White
    Write-Host "4. Follow test checklist to verify all features" -ForegroundColor White
    Write-Host ""
    Write-Host "IMPORTANT: Manual browser testing is REQUIRED!" -ForegroundColor Red

} catch {
    Write-Host "Verification error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
