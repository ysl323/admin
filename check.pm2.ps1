Import-Module Posh-SSH

$serverIP = "47.97.185.117"
$username = "root"
$password = "Admin88868"

$securePassword = ConvertTo-SecureString $password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ($username, $securePassword)

Write-Host "Checking..."

try {
    $session = New-SSHSession -ComputerName $serverIP -Credential $credential -AcceptKey -ErrorAction Stop
    
    # Check PM2
    $statusCmd = "pm2 list"
    $statusResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $statusCmd
    Write-Host $statusResult.Output
    
    # Check ecosystem file
    Write-Host "`n=== Ecosystem file ==="
    $catCmd = "cat /root/english-learning/backend/ecosystem.config.js 2>/dev/null || echo 'No file'"
    $catResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $catCmd
    Write-Host $catResult.Output
    
    # Try starting manually
    Write-Host "`n=== Try start manually ==="
    $startCmd = "cd /root/english-learning/backend && NODE_ENV=production node src/index.js &"
    Invoke-SSHCommand -SessionId $session.SessionId -Command $startCmd | Out-Null
    
    Start-Sleep -Seconds 3
    
    # Check if running
    $checkCmd = "ps aux | grep node"
    $checkResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $checkCmd
    Write-Host $checkResult.Output
    
    # Check logs
    $logCmd = "pm2 logs english-learning-backend --lines 20 --nostream 2>/dev/null || tail -20 /root/.pm2/logs/english-learning-backend-out.log"
    $logResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $logCmd
    Write-Host $logResult.Output
    
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
