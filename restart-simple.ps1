Import-Module Posh-SSH

$serverIP = "47.97.185.117"
$username = "root"
$password = "Admin88868"

$securePassword = ConvertTo-SecureString $password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ($username, $securePassword)

Write-Host "Restarting with production env..."

try {
    $session = New-SSHSession -ComputerName $serverIP -Credential $credential -AcceptKey -ErrorAction Stop
    
    # Simple restart with environment variable inline
    Write-Host "=== Restarting ==="
    $cmd = "cd /root/english-learning/backend && pm2 start src/index.js --name english-learning-backend -- --env production"
    $result = Invoke-SSHCommand -SessionId $session.SessionId -Command $cmd
    Write-Host $result.Output
    
    Start-Sleep -Seconds 5
    
    # Check logs
    Write-Host "=== Logs ==="
    $logCmd = "pm2 logs english-learning-backend --lines 20 --nostream"
    $logResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $logCmd
    Write-Host $logResult.Output
    
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
    
    Write-Host "=== DONE ===" -ForegroundColor Green
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
