# 测试各个 API 端点
Import-Module Posh-SSH

$password = ConvertTo-SecureString "Admin88868" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential("root", $password)

$sshSession = New-SSHSession -ComputerName "47.97.185.117" -Credential $credential -AcceptKey -Force

Write-Host "=== 测试各个 API ===" -ForegroundColor Cyan
Write-Host "`n--- /api/categories ---" -ForegroundColor Yellow
$result1 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "curl -s http://localhost:3000/api/categories"
Write-Host $result1.Output

Write-Host "`n--- /api/auth/login ---" -ForegroundColor Yellow
$result2 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "curl -s -X POST http://localhost:3000/api/auth/login -H 'Content-Type: application/json' -d '{}'"
Write-Host $result2.Output

Write-Host "`n--- 检查路由文件大小 ---" -ForegroundColor Yellow
$result3 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "ls -la /root/english-learning/backend/src/routes/auth.js"
Write-Host $result3.Output

Write-Host "`n--- 检查 auth.js 内容前 20 行 ---" -ForegroundColor Yellow
$result4 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "head -20 /root/english-learning/backend/src/routes/auth.js"
Write-Host $result4.Output

# 检查是否有语法错误
Write-Host "`n--- 检查 Node 启动错误 ---" -ForegroundColor Yellow
$result5 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "pm2 logs english-learning-backend --err --lines 30 --nostream"
Write-Host $result5.Output

Remove-SSHSession -SessionId $sshSession.SessionId
