Import-Module Posh-SSH

$serverIP = "47.97.185.117"
$username = "root"
$password = "Admin88868"

$securePassword = ConvertTo-SecureString $password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ($username, $securePassword)

Write-Host "Restoring from backup..."

try {
    $session = New-SSHSession -ComputerName $serverIP -Credential $credential -AcceptKey -ErrorAction Stop
    
    # Restore from backup
    Write-Host "=== Restoring ==="
    $cmd = "cp -r /root/english-learning-backup-20260314_043602/* /root/english-learning/ 2>/dev/null || echo 'No backup'"
    $result = Invoke-SSHCommand -SessionId $session.SessionId -Command $cmd
    Write-Host "Result: $($result.Output)"
    
    # Start backend
    Write-Host "=== Starting backend ==="
    $startCmd = "cd /root/english-learning/backend && pm2 start src/index.js --name english-learning-backend"
    Invoke-SSHCommand -SessionId $session.SessionId -Command $startCmd | Out-Null
    
    Start-Sleep -Seconds 5
    
    # Check status
    Write-Host "=== Status ==="
    $statusCmd = "pm2 list"
    $statusResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $statusCmd
    Write-Host $statusResult.Output
    
    # Check logs
    Write-Host "=== Logs ==="
    $logCmd = "pm2 logs english-learning-backend --lines 15 --nostream"
    $logResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $logCmd
    Write-Host $logResult.Output
    
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
    
    Write-Host "=== RESTORED ===" -ForegroundColor Green
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
