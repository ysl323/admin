Import-Module Posh-SSH

$serverIP = "47.97.185.117"
$username = "root"
$password = "Admin88868"

$securePassword = ConvertTo-SecureString $password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ($username, $securePassword)

Write-Host "Starting server..."

try {
    $session = New-SSHSession -ComputerName $serverIP -Credential $credential -AcceptKey -ErrorAction Stop
    
    # Start with NODE_ENV=production
    Write-Host "`n=== Starting backend ==="
    $startCmd = "cd /root/english-learning/backend && NODE_ENV=production pm2 start src/index.js --name english-learning-backend"
    $startResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $startCmd
    Write-Host $startResult.Output
    
    Start-Sleep -Seconds 5
    
    # Check PM2 status
    Write-Host "`n=== PM2 Status ==="
    $statusCmd = "pm2 list"
    $statusResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $statusCmd
    Write-Host $statusResult.Output
    
    # Check logs
    Write-Host "`n=== Logs ==="
    $logCmd = "pm2 logs english-learning-backend --lines 20 --nostream"
    $logResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $logCmd
    Write-Host $logResult.Output
    
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
    
    Write-Host "`n=== DONE ===" -ForegroundColor Green
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
