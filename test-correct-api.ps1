# 测试正确的 API 路径
Import-Module Posh-SSH

$password = ConvertTo-SecureString "Admin88868" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential("root", $password)

$sshSession = New-SSHSession -ComputerName "47.97.185.117" -Credential $credential -AcceptKey -Force

Write-Host "=== 测试正确的 API 路径 ===" -ForegroundColor Cyan

Write-Host "`n--- /api/learning/categories (需要登录) ---" -ForegroundColor Yellow
$result1 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "curl -s http://localhost:3000/api/learning/categories"
Write-Host $result1.Output

Write-Host "`n--- /api/admin/categories (管理后台) ---" -ForegroundColor Yellow
$result2 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "curl -s http://localhost:3000/api/admin/categories"
Write-Host $result2.Output

# 尝试登录
Write-Host "`n--- 尝试登录 ---" -ForegroundColor Yellow
$result3 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "curl -s -X POST http://localhost:3000/api/auth/login -H 'Content-Type: application/json' -d '{\"username\":\"admin\",\"password\":\"admin123\"}'"
Write-Host $result3.Output

# 测试外网访问
Write-Host "`n=== 测试外网访问 ===" -ForegroundColor Cyan
$result4 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "curl -s -o /dev/null -w '%{http_code}' http://47.97.185.117/api/auth/login"
Write-Host "外网登录返回: $($result4.Output)"

Remove-SSHSession -SessionId $sshSession.SessionId
