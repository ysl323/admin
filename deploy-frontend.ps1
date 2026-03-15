# 备份并部署前端
Import-Module Posh-SSH

$password = ConvertTo-SecureString "Admin88868" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential("root", $password)

$sshSession = New-SSHSession -ComputerName "47.97.185.117" -Credential $credential -AcceptKey -Force

# 1. 备份当前代码
$backupTime = Get-Date -Format "yyyyMMdd_HHmmss"
Write-Host "=== 备份当前代码 ===" -ForegroundColor Cyan
$result1 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "cp -r /root/english-learning/frontend/dist /root/english-learning/frontend/dist-backup-$backupTime"
Write-Host "备份完成: dist-backup-$backupTime"

# 2. 查看本地 dist 目录
Write-Host "`n=== 本地 dist 目录 ===" -ForegroundColor Cyan
$result2 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "ls -la e:/demo/my1/my1/frontend/dist/assets/ | head -20"
Write-Host $result2.Output

Remove-SSHSession -SessionId $sshSession.SessionId
