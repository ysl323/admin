# 测试后端 API 返回内容
Import-Module Posh-SSH

$password = ConvertTo-SecureString "Admin88868" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential("root", $password)

$sshSession = New-SSHSession -ComputerName "47.97.185.117" -Credential $credential -AcceptKey -Force

# 测试 localhost:3000 直接返回内容
Write-Host "=== 测试后端直接返回 ===" -ForegroundColor Cyan
$result1 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "curl -s http://localhost:3000/"
Write-Host $result1.Output

Write-Host "`n=== 测试 categories API ===" -ForegroundColor Cyan
$result2 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "curl -s http://localhost:3000/api/categories"
Write-Host $result2.Output

Write-Host "`n=== 测试根路径 ===" -ForegroundColor Cyan
$result3 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "curl -v http://localhost:3000/ 2>&1 | head -30"
Write-Host $result3.Output

# 检查进程是否正常
Write-Host "`n=== 检查 Node 进程 ===" -ForegroundColor Cyan
$result4 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "ps aux | grep node"
Write-Host $result4.Output

Remove-SSHSession -SessionId $sshSession.SessionId
