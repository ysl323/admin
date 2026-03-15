Import-Module Posh-SSH

$serverIP = "47.97.185.117"
$username = "root"
$password = "Admin88868"

$securePassword = ConvertTo-SecureString $password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ($username, $securePassword)

Write-Host "Uploading updated files to server..." -ForegroundColor Yellow

try {
    # Create SFTP session
    Write-Host "Connecting to server..." -ForegroundColor Gray
    $sftpSession = New-SFTPSession -ComputerName $serverIP -Credential $credential -AcceptKey

    # Create directories if they don't exist
    Write-Host "Creating directories..." -ForegroundColor Gray
    $sshSession = New-SSHSession -ComputerName $serverIP -Credential $credential -AcceptKey
    Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "mkdir -p /root/english-learning/backend/src/services"
    Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "mkdir -p /root/english-learning/backend/src/routes"
    Remove-SSHSession -SessionId $sshSession.SessionId

    # Upload AdminService.js
    Write-Host "Uploading AdminService.js..." -ForegroundColor Gray
    Set-SFTPItem -SessionId $sftpSession.SessionId -Path "e:\demo\my1\my1\backend\src\services\AdminService.js" -Destination "/root/english-learning/backend/src/services/AdminService.js" -Force

    # Upload admin.js
    Write-Host "Uploading admin.js..." -ForegroundColor Gray
    Set-SFTPItem -SessionId $sftpSession.SessionId -Path "e:\demo\my1\my1\backend\src\routes\admin.js" -Destination "/root/english-learning/backend/src/routes/admin.js" -Force

    Write-Host "Files uploaded successfully!" -ForegroundColor Green

    # Remove SFTP session
    Remove-SFTPSession -SessionId $sftpSession.SessionId

    # Restart service
    Write-Host "`nRestarting backend service..." -ForegroundColor Yellow
    $sshSession = New-SSHSession -ComputerName $serverIP -Credential $credential -AcceptKey
    Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "cd /root/english-learning/backend && pm2 restart english-learning-backend"
    Remove-SSHSession -SessionId $sshSession.SessionId

    Write-Host "Deployment complete!" -ForegroundColor Green
    Write-Host "Test at: http://47.97.185.117/admin" -ForegroundColor Cyan

} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Gray
}
