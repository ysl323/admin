# 测试登录
Import-Module Posh-SSH

$password = ConvertTo-SecureString "Admin88868" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential("root", $password)

$sshSession = New-SSHSession -ComputerName "47.97.185.117" -Credential $credential -AcceptKey -Force

# 使用 echo 管道发送 JSON 数据
Write-Host "=== 测试登录 ===" -ForegroundColor Cyan

# 方法1：使用 -d 读取文件
$loginJson = '{"username":"admin","password":"admin123"}'
$result = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "echo '$loginJson' | curl -s -X POST http://localhost:3000/api/auth/login -H 'Content-Type: application/json' -d @-"
Write-Host $result.Output

Write-Host "`n=== 通过 Nginx 测试 ===" -ForegroundColor Cyan
$result2 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "echo '$loginJson' | curl -s -X POST http://47.97.185.117/api/auth/login -H 'Content-Type: application/json' -d @-"
Write-Host $result2.Output

Remove-SSHSession -SessionId $sshSession.SessionId
