# 检查服务器上前端代码
Import-Module Posh-SSH

$password = ConvertTo-SecureString "Admin88868" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential("root", $password)

$sshSession = New-SSHSession -ComputerName "47.97.185.117" -Credential $credential -AcceptKey -Force

Write-Host "=== 检查服务器上 LearningModeSelector ===" -ForegroundColor Cyan
$result1 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "grep -n '随机学习' /root/english-learning/frontend/dist/assets/*.js | head -5"
Write-Host $result1.Output

Write-Host "`n=== 检查 dist 目录时间 ===" -ForegroundColor Cyan
$result2 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "ls -la /root/english-learning/frontend/dist/"
Write-Host $result2.Output

Remove-SSHSession -SessionId $sshSession.SessionId
