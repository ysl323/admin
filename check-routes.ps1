# 检查服务器上的路由文件
Import-Module Posh-SSH

$password = ConvertTo-SecureString "Admin88868" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential("root", $password)

$sshSession = New-SSHSession -ComputerName "47.97.185.117" -Credential $credential -AcceptKey -Force

# 检查路由文件是否存在
Write-Host "=== 检查路由文件 ===" -ForegroundColor Cyan
$result1 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "ls -la /root/english-learning/backend/src/routes/"
Write-Host $result1.Output

# 检查主入口文件
Write-Host "`n=== 检查主入口文件 ===" -ForegroundColor Cyan
$result2 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "head -50 /root/english-learning/backend/src/index.js"
Write-Host $result2.Output

# 检查 auth 路由文件
Write-Host "`n=== 检查 auth 路由 ===" -ForegroundColor Cyan
$result3 = Invoke-SSHCommand -SessionId $sshSession.Session -Command "head -30 /root/english-learning/backend/src/routes/auth.js"
Write-Host $result3.Output

# 直接测试 /health 端点
Write-Host "`n=== 测试 /health 端点 ===" -ForegroundColor Cyan
$result4 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "curl -s http://localhost:3000/health"
Write-Host $result4.Output

Remove-SSHSession -SessionId $sshSession.SessionId
