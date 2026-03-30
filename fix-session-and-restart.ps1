# 修复 Session 配置并重启后端

$server = "47.97.185.117"
$password = "Admin88868"

Write-Host "上传修复后的 session 配置..." -ForegroundColor Cyan

# 使用 scp 上传文件
scp backend/src/config/session.js root@${server}:/root/english-learning/backend/src/config/session.js

Write-Host "`n重启后端服务..." -ForegroundColor Cyan

# 使用 Posh-SSH
if (!(Get-Module -ListAvailable -Name Posh-SSH)) {
    Install-Module -Name Posh-SSH -Force -Scope CurrentUser
}

Import-Module Posh-SSH

$securePassword = ConvertTo-SecureString $password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ("root", $securePassword)

$session = New-SSHSession -ComputerName $server -Credential $credential -AcceptKey

# 重启 PM2 服务
$result = Invoke-SSHCommand -SessionId $session.SessionId -Command "pm2 restart english-learning-backend"
Write-Host $result.Output

# 等待服务启动
Start-Sleep -Seconds 3

# 检查状态
$status = Invoke-SSHCommand -SessionId $session.SessionId -Command "pm2 status"
Write-Host $status.Output

Remove-SSHSession -SessionId $session.SessionId

Write-Host "`n✅ 修复完成！" -ForegroundColor Green
Write-Host "现在测试登录..." -ForegroundColor Cyan

# 测试登录
Start-Sleep -Seconds 2
& ./test-login-simple.ps1
