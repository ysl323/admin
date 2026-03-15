# 简单测试
Import-Module Posh-SSH

$password = ConvertTo-SecureString "Admin88868" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential("root", $password)

$sshSession = New-SSHSession -ComputerName "47.97.185.117" -Credential $credential -AcceptKey -Force

Write-Host "=== 通过 Nginx 访问 ===" -ForegroundColor Cyan
$result1 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "curl http://localhost:80/api/auth/login 2>/dev/null"
Write-Host $result1.Output

Write-Host "`n=== 直接访问后端 ===" -ForegroundColor Cyan
$result2 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "curl http://localhost:3000/api/auth/login 2>/dev/null"
Write-Host $result2.Output

Write-Host "`n=== Nginx 错误日志 ===" -ForegroundColor Cyan
$result3 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "tail -10 /var/log/nginx/error.log 2>/dev/null"
Write-Host $result3.Output

Remove-SSHSession -SessionId $sshSession.SessionId
