Import-Module Posh-SSH

$serverIP = "47.97.185.117"
$username = "root"
$password = "Admin88868"

$securePassword = ConvertTo-SecureString $password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ($username, $securePassword)

Write-Host "Setting production environment..."

try {
    $session = New-SSHSession -ComputerName $serverIP -Credential $credential -AcceptKey -ErrorAction Stop
    
    # Stop current process
    Write-Host "`n=== Stopping ==="
    Invoke-SSHCommand -SessionId $session.SessionId -Command "pm2 stop english-learning-backend" | Out-Null
    Invoke-SSHCommand -SessionId $session.SessionId -Command "pm2 delete english-learning-backend" | Out-Null
    
    # Start with environment variable
    Write-Host "`n=== Starting with NODE_ENV ==="
    $startCmd = "cd /root/english-learning/backend && pm2 start src/index.js --name english-learning-backend --env production"
    $startResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $startCmd
    Write-Host $startResult.Output
    
    # Wait and check
    Start-Sleep -Seconds 6
    
    # Check logs
    Write-Host "`n=== Logs ==="
    $logCmd = "pm2 logs english-learning-backend --lines 25 --nostream"
    $logResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $logCmd
    Write-Host $logResult.Output
    
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
    
    Write-Host "`n=== DONE ===" -ForegroundColor Green
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
