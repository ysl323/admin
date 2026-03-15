Import-Module Posh-SSH

$serverIP = "47.97.185.117"
$username = "root"
$password = "Admin88868"

$securePassword = ConvertTo-SecureString $password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ($username, $securePassword)

Write-Host "Fixing environment..."

try {
    $session = New-SSHSession -ComputerName $serverIP -Credential $credential -AcceptKey -ErrorAction Stop
    
    # Check PM2 startup command
    Write-Host "`n=== PM2 Startup Command ==="
    $pm2Cmd = "pm2 show english-learning-backend"
    $pm2Result = Invoke-SSHCommand -SessionId $session.SessionId -Command $pm2Cmd
    Write-Host $pm2Result.Output
    
    # Stop and delete current process
    Write-Host "`n=== Stopping PM2 ==="
    $stopCmd = "pm2 delete english-learning-backend"
    Invoke-SSHCommand -SessionId $session.SessionId -Command $stopCmd | Out-Null
    
    # Start with NODE_ENV=production
    Write-Host "`n=== Starting with NODE_ENV=production ==="
    $startCmd = "cd /root/english-learning/backend && NODE_ENV=production pm2 start src/server.js --name english-learning-backend --node-args='--max-old-space-size=512'"
    $startResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $startCmd
    Write-Host $startResult.Output
    
    Start-Sleep -Seconds 5
    
    # Check logs
    Write-Host "`n=== Recent Logs ==="
    $logCmd = "pm2 logs english-learning-backend --lines 20 --nostream"
    $logResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $logCmd
    Write-Host $logResult.Output
    
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
    
    Write-Host "`n=== DONE ===" -ForegroundColor Green
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
