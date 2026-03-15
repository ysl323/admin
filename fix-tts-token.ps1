Import-Module Posh-SSH

$serverIP = "47.97.185.117"
$username = "root"
$password = "Admin88868"
$newToken = "eoJGAyB7DH8MR4IQ_yhx3tUlAUtWBCCq"

$securePassword = ConvertTo-SecureString $password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ($username, $securePassword)

Write-Host "Connecting to server..."

try {
    $session = New-SSHSession -ComputerName $serverIP -Credential $credential -AcceptKey -ErrorAction Stop
    Write-Host "Connected!"
    
    # Update using correct column name 'key'
    Write-Host "`n=== Updating Token ==="
    $updateCmd = "sqlite3 /root/english-learning/backend/database.sqlite `"UPDATE config SET value = '$newToken', updated_at = datetime('now') WHERE key = 'volcengine_api_key';"""
    $updateResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $updateCmd
    Write-Host "Update result: $updateResult"
    
    # Verify
    Write-Host "`n=== Verify ==="
    $verifyCmd = "sqlite3 /root/english-learning/backend/database.sqlite 'SELECT * FROM config WHERE key = 'volcengine_api_key';'"
    $verifyResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $verifyCmd
    Write-Host $verifyResult.Output
    
    # Restart backend
    Write-Host "`n=== Restart Backend ==="
    Invoke-SSHCommand -SessionId $session.SessionId -Command "pm2 restart english-learning-backend" | Out-Null
    
    Start-Sleep -Seconds 4
    
    # Check logs
    Write-Host "`n=== Recent Logs ==="
    $logResult = Invoke-SSHCommand -SessionId $session.SessionId -Command "pm2 logs english-learning-backend --lines 20 --nostream"
    Write-Host $logResult.Output
    
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
    
    Write-Host "`n=== DONE ===" -ForegroundColor Green
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
