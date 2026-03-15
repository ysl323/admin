Import-Module Posh-SSH

$serverIP = "47.97.185.117"
$username = "root"
$password = "Admin88868"

$securePassword = ConvertTo-SecureString $password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ($username, $securePassword)

Write-Host "Fixing..."

try {
    $session = New-SSHSession -ComputerName $serverIP -Credential $credential -AcceptKey -ErrorAction Stop
    
    # Check current .env
    Write-Host "=== Current .env ==="
    $cmd = "cat /root/english-learning/.env"
    $result = Invoke-SSHCommand -SessionId $session.SessionId -Command $cmd
    Write-Host $result.Output
    
    # Update .env to production
    Write-Host "`n=== Updating .env ==="
    $updateCmd = "sed -i 's/NODE_ENV=development/NODE_ENV=production/' /root/english-learning/.env"
    Invoke-SSHCommand -SessionId $session.SessionId -Command $updateCmd | Out-Null
    
    # Verify
    Write-Host "`n=== Verify ==="
    $verifyCmd = "cat /root/english-learning/.env | head -5"
    $verifyResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $verifyCmd
    Write-Host $verifyResult.Output
    
    # Restart
    Write-Host "`n=== Restarting ==="
    $restartCmd = "pm2 restart english-learning-backend"
    Invoke-SSHCommand -SessionId $session.SessionId -Command $restartCmd | Out-Null
    
    Start-Sleep -Seconds 5
    
    # Check logs
    Write-Host "`n=== Logs ==="
    $logCmd = "pm2 logs english-learning-backend --lines 15 --nostream"
    $logResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $logCmd
    Write-Host $logResult.Output
    
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
    
    Write-Host "`n=== DONE ===" -ForegroundColor Green
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
