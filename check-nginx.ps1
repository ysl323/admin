# 检查 Nginx 配置
Import-Module Posh-SSH

$password = ConvertTo-SecureString "Admin88868" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential("root", $password)

$sshSession = New-SSHSession -ComputerName "47.97.185.117" -Credential $credential -AcceptKey -Force

Write-Host "=== Nginx 配置文件 ===" -ForegroundColor Cyan
$result1 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "cat /etc/nginx/sites-enabled/default"
Write-Host $result1.Output

Write-Host "`n=== Nginx 配置目录 ===" -ForegroundColor Cyan
$result2 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "ls -la /etc/nginx/conf.d/"
Write-Host $result2.Output

Write-Host "`n=== 测试 Nginx 到后端 ===" -ForegroundColor Cyan
$result3 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "curl -s -o /dev/null -w '%{http_code}' http://localhost:80/api/auth/login"
Write-Host "Nginx 本地代理: $($result3.Output)"

Remove-SSHSession -SessionId $sshSession.SessionId
