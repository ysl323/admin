# 直接测试 Nginx 代理
Import-Module Posh-SSH

$password = ConvertTo-SecureString "Admin88868" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential("root", $password)

$sshSession = New-SSHSession -ComputerName "47.97.185.117" -Credential $credential -AcceptKey -Force

Write-Host "=== 通过 Nginx 访问 API ===" -ForegroundColor Cyan

# 通过 localhost:80 访问
Write-Host "`n--- curl localhost:80/api/auth/login ---" -ForegroundColor Yellow
$result1 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "curl -s -X POST http://localhost:80/api/auth/login -H 'Content-Type: application/json' -d '{\'username\':\'admin\',\'password\':\'admin123\'}'"
Write-Host $result1.Output

# 详细查看
Write-Host "`n--- curl -v localhost:80/api/auth/login ---" -ForegroundColor Yellow
$result2 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "curl -v -X POST http://localhost:80/api/auth/login -H 'Content-Type: application/json' -d '{\'username\':\'test\',\'password\':\'test\'}' 2>&1 | head -20"
Write-Host $result2.Output

# 检查后端是否真的在 3000 端口
Write-Host "`n=== 检查端口连接 ===" -ForegroundColor Cyan
$result3 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "telnet localhost 3000 <<< 'GET /health HTTP/1.1\r\nHost: localhost\r\n\r\n' 2>/dev/null | head -5"
Write-Host $result3.Output

Remove-SSHSession -SessionId $sshSession.SessionId
