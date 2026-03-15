# 检查服务器状态
Import-Module Posh-SSH

$password = ConvertTo-SecureString "Admin88868" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential("root", $password)

# 创建 SSH 会话
$sshSession = New-SSHSession -ComputerName "47.97.185.117" -Credential $credential -AcceptKey -Force

# 1. 查看 PM2 服务状态
Write-Host "=== PM2 服务状态 ===" -ForegroundColor Cyan
$result1 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "pm2 list"
Write-Host $result1.Output

# 2. 查看后端日志（最近错误）
Write-Host "`n=== 最近错误日志 ===" -ForegroundColor Cyan
$result2 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "pm2 logs english-learning-backend --lines 20 --nostream"
Write-Host $result2.Output

# 3. 检查 Nginx 状态
Write-Host "`n=== Nginx 状态 ===" -ForegroundColor Cyan
$result3 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "systemctl status nginx | head -10"
Write-Host $result3.Output

# 4. 测试后端是否响应
Write-Host "`n=== 测试后端 API ===" -ForegroundColor Cyan
$result4 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/categories"
Write-Host "后端返回状态: $($result4.Output)"

# 5. 查看端口监听
Write-Host "`n=== 端口监听 ===" -ForegroundColor Cyan
$result5 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "netstat -tlnp | grep -E '80|3000'"
Write-Host $result5.Output

# 断开连接
Remove-SSHSession -SessionId $sshSession.SessionId
