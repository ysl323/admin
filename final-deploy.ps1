Import-Module Posh-SSH

$serverIP = "47.97.185.117"
$username = "root"
$password = "Admin88868"

$securePassword = ConvertTo-SecureString $password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ($username, $securePassword)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Final Deployment of Export Feature" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

try {
    Write-Host "`n[1/4] Connecting to server..." -ForegroundColor Yellow
    $session = New-SSHSession -ComputerName $serverIP -Credential $credential -AcceptKey
    Write-Host "Connected" -ForegroundColor Green

    # Backup
    Write-Host "`n[2/4] Backing up existing files..." -ForegroundColor Yellow
    Invoke-SSHCommand -SessionId $session.SessionId -Command "cd /root/english-learning && mkdir -p backup-20260315 && cp backend/src/services/AdminService.js backup-20260315/ && cp backend/src/routes/admin.js backup-20260315/ && echo 'Backup done'"

    # Read local files
    Write-Host "`n[3/4] Reading local files..." -ForegroundColor Yellow
    $adminServiceContent = Get-Content "e:\demo\my1\my1\backend\src\services\AdminService.js" -Raw -Encoding UTF8
    $adminRoutesContent = Get-Content "e:\demo\my1\my1\backend\src\routes\admin.js" -Raw -Encoding UTF8
    Write-Host "Files read" -ForegroundColor Green

    # Upload files using SSH
    Write-Host "`nUploading files to server..." -ForegroundColor Gray
    Invoke-SSHCommand -SessionId $session.SessionId -Command "cat > /root/english-learning/backend/src/services/AdminService.js << 'EOFFILE'
$adminServiceContent
EOFFILE"

    Invoke-SSHCommand -SessionId $session.SessionId -Command "cat > /root/english-learning/backend/src/routes/admin.js << 'EOFFILE'
$adminRoutesContent
EOFFILE"

    Write-Host "Files uploaded" -ForegroundColor Green

    # Restart service
    Write-Host "`n[4/4] Restarting service..." -ForegroundColor Yellow
    Invoke-SSHCommand -SessionId $session.SessionId -Command "cd /root/english-learning/backend && pm2 restart english-learning-backend"
    Write-Host "Service restarted" -ForegroundColor Green

    Remove-SSHSession -SessionId $session.SessionId

    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "Deployment Complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "`nTest at: http://47.97.185.117/admin" -ForegroundColor Cyan
    Write-Host "Login: admin / admin123" -ForegroundColor Cyan

} catch {
    Write-Host "`nError: $($_.Exception.Message)" -ForegroundColor Red
    if ($session) {
        Remove-SSHSession -SessionId $session.SessionId -ErrorAction SilentlyContinue
    }
}
