Import-Module Posh-SSH

$serverIP = "47.97.185.117"
$username = "root"
$password = "Admin88868"

$securePassword = ConvertTo-SecureString $password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ($username, $securePassword)

Write-Host "Restarting..."

try {
    $session = New-SSHSession -ComputerName $serverIP -Credential $credential -AcceptKey -ErrorAction Stop
    
    # Kill any existing node processes
    Write-Host "=== Kill existing ==="
    Invoke-SSHCommand -SessionId $session.SessionId -Command "pkill -f 'node src/index.js' || true" | Out-Null
    
    Start-Sleep -Seconds 2
    
    # Start with PM2 using ecosystem
    Write-Host "=== Starting ==="
    $startCmd = "cd /root/english-learning/backend && pm2 start ecosystem.config.js"
    $startResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $startCmd
    Write-Host "Start result: $($startResult.ExitStatus)"
    
    Start-Sleep -Seconds 5
    
    # Check status
    Write-Host "=== Status ==="
    $statusCmd = "pm2 list"
    $statusResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $statusCmd
    Write-Host $statusResult.Output
    
    # Check logs
    Write-Host "=== Logs ==="
    $logCmd = "pm2 logs --lines 25 --nostream 2>&1 | tail -30"
    $logResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $logCmd
    Write-Host $logResult.Output
    
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
    
    Write-Host "=== DONE ===" -ForegroundColor Green
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
