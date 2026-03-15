# 检查后端状态
Import-Module Posh-SSH

$password = ConvertTo-SecureString "Admin88868" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential("root", $password)

$sshSession = New-SSHSession -ComputerName "47.97.185.117" -Credential $credential -AcceptKey -Force

Write-Host "=== PM2 状态 ===" -ForegroundColor Cyan
$result1 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "pm2 list"
Write-Host $result1.Output

Write-Host "`n=== 后端日志 ===" -ForegroundColor Cyan
$result2 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "pm2 logs english-learning-backend --lines 30 --nostream"
Write-Host $result2.Output

Write-Host "`n=== 测试后端 ===" -ForegroundColor Cyan
$result3 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "curl http://localhost:3000/health 2>/dev/null"
Write-Host $result3.Output

Remove-SSHSession -SessionId $sshSession.SessionId
