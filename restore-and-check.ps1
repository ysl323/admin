Import-Module Posh-SSH

$serverIP = "47.97.185.117"
$username = "root"
$password = "Admin88868"

$securePassword = ConvertTo-SecureString $password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ($username, $securePassword)

Write-Host "Restoring from backup..." -ForegroundColor Yellow

$session = New-SSHSession -ComputerName $serverIP -Credential $credential -AcceptKey

# Restore original files
Invoke-SSHCommand -SessionId $session.SessionId -Command "cd /root/english-learning && cp backup-20260315/AdminService.js backend/src/services/ && cp backup-20260315/admin.js backend/src/routes/ && echo 'Files restored'"

# Restart
Invoke-SSHCommand -SessionId $session.SessionId -Command "cd /root/english-learning/backend && pm2 restart english-learning-backend"

Write-Host "Service restarted" -ForegroundColor Green

# Check last lines of AdminService.js
Write-Host "`nLast 5 lines of AdminService.js:" -ForegroundColor Cyan
$result = Invoke-SSHCommand -SessionId $session.SessionId -Command "cd /root/english-learning/backend/src/services && tail -5 AdminService.js"
Write-Host $result.Output

Remove-SSHSession -SessionId $session.SessionId

Write-Host "`nDone. Service should be back online." -ForegroundColor Green
