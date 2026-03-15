Import-Module Posh-SSH

$serverIP = "47.97.185.117"
$username = "root"
$password = "Admin88868"

$securePassword = ConvertTo-SecureString $password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ($username, $securePassword)

Write-Host "Analyzing server..."

try {
    $session = New-SSHSession -ComputerName $serverIP -Credential $credential -AcceptKey -ErrorAction Stop
    
    # Check PM2 status
    Write-Host "`n=== PM2 Status ==="
    $statusCmd = "pm2 list"
    $statusResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $statusCmd
    Write-Host $statusResult.Output
    
    # Check Nginx status
    Write-Host "`n=== Nginx Status ==="
    $nginxCmd = "systemctl status nginx | head -10"
    $nginxResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $nginxCmd
    Write-Host $nginxResult.Output
    
    # Check disk space
    Write-Host "`n=== Disk Space ==="
    $diskCmd = "df -h"
    $diskResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $diskCmd
    Write-Host $diskResult.Output
    
    # Check memory usage
    Write-Host "`n=== Memory Usage ==="
    $memCmd = "free -h"
    $memResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $memCmd
    Write-Host $memResult.Output
    
    # Check Node version
    Write-Host "`n=== Node Version ==="
    $nodeCmd = "node -v"
    $nodeResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $nodeCmd
    Write-Host $nodeResult.Output
    
    # Check if there's any audio-cache directory
    Write-Host "`n=== Audio Cache ==="
    $cacheCmd = "ls -la /root/english-learning/backend/audio-cache 2>/dev/null | head -10 || echo 'No cache dir'"
    $cacheResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $cacheCmd
    Write-Host $cacheResult.Output
    
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
