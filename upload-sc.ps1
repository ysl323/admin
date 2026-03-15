# 使用 Posh-SSH SCP
Import-Module Posh-SSH

$password = ConvertTo-SecureString "Admin88868" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential("root", $password)

# 连接
Write-Host "连接服务器..." -ForegroundColor Cyan
$sshSession = New-SSHSession -ComputerName "47.97.185.117" -Credential $credential -AcceptKey -Force

# 备份
$backupTime = Get-Date -Format "yyyyMMdd_HHmmss"
Write-Host "备份..."
Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "cp -r /root/english-learning/frontend/dist /root/english-learning/frontend/dist-backup-$backupTime"

# 上传 index.html
Write-Host "上传 index.html..."
Set-SCPFile -SessionId $sshSession.SessionId -LocalFile "e:\demo\my1\my1\frontend\dist\index.html" -RemotePath "/root/english-learning/frontend/dist/index.html"

# 上传 assets 目录
Write-Host "上传 assets..."
Set-SCPFile -SessionId $sshSession.SessionId -LocalPath "e:\demo\my1\my1\frontend\dist\assets" -RemotePath "/root/english-learning/frontend/dist/" -Recurse

Write-Host "完成!"
Remove-SSHSession -SessionId $sshSession.SessionId
