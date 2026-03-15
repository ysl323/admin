# 检查 Nginx 配置文件
Import-Module Posh-SSH

$password = ConvertTo-SecureString "Admin88868" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential("root", $password)

$sshSession = New-SSHSession -ComputerName "47.97.185.117" -Credential $credential -AcceptKey -Force

Write-Host "=== Nginx 配置文件 ===" -ForegroundColor Cyan
$result1 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "cat /etc/nginx/conf.d/english-learning.conf"
Write-Host $result1.Output

# 测试根路径
Write-Host "`n=== 测试首页 ===" -ForegroundColor Cyan
$result2 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "curl -s http://localhost:80/"
Write-Host $result2.Output

Remove-SSHSession -SessionId $sshSession.SessionId
