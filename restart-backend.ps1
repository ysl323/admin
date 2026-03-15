# 重启后端服务
Import-Module Posh-SSH

$password = ConvertTo-SecureString "Admin88868" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential("root", $password)

$sshSession = New-SSHSession -ComputerName "47.97.185.117" -Credential $credential -AcceptKey -Force

# 重启后端服务
Write-Host "=== 重启后端服务 ===" -ForegroundColor Cyan
$result = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "pm2 restart english-learning-backend"
Write-Host $result.Output

Start-Sleep -Seconds 3

# 等待后启动后测试
Write-Host "`n=== 等待服务启动 ===" -ForegroundColor Cyan
$result2 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "sleep 5 && curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/categories"
Write-Host "后端状态: $($result2.Output)"

# 查看日志
Write-Host "`n=== 检查日志 ===" -ForegroundColor Cyan
$result3 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "pm2 logs english-learning-backend --lines 10 --nostream"
Write-Host $result3.Output

Remove-SSHSession -SessionId $sshSession.SessionId
