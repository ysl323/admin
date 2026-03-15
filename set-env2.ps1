Import-Module Posh-SSH

$serverIP = "47.97.185.117"
$username = "root"
$password = "Admin88868"

$securePassword = ConvertTo-SecureString $password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ($username, $securePassword)

Write-Host "Setting production environment..."

try {
    $session = New-SSHSession -ComputerName $serverIP -Credential $credential -AcceptKey -ErrorAction Stop
    
    # Stop current
    Write-Host "`n=== Stopping ==="
    Invoke-SSHCommand -SessionId $session.SessionId -Command "pm2 stop english-learning-backend" | Out-Null
    Invoke-SSHCommand -SessionId $session.SessionId -Command "pm2 delete english-learning-backend" | Out-Null
    
    # Write ecosystem.config.js
    Write-Host "`n=== Creating ecosystem config ==="
    $ecosystem = @"
module.exports = {
  apps: [{
    name: 'english-learning-backend',
    script: 'src/index.js',
    cwd: '/root/english-learning/backend',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/root/.pm2/logs/english-learning-backend-error.log',
    out_file: '/root/.pm2/logs/english-learning-backend-out.log',
    time: true
  }]
}
"@
    $cmd = "echo `"$ecosystem`" > /root/english-learning/backend/ecosystem.config.js"
    Invoke-SSHCommand -SessionId $session.SessionId -Command $cmd | Out-Null
    
    # Start with ecosystem config
    Write-Host "`n=== Starting ==="
    $startCmd = "cd /root/english-learning/backend && pm2 start ecosystem.config.js"
    $startResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $startCmd
    Write-Host $startResult.Output
    
    # Wait
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
