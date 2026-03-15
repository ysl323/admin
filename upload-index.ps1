# 上传 index.html
Import-Module Posh-SSH

$password = ConvertTo-SecureString "Admin88868" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential("root", $password)

$sshSession = New-SSHSession -ComputerName "47.97.185.117" -Credential $credential -AcceptKey -Force

# 读取本地 index.html 内容
$indexContent = Get-Content "e:\demo\my1\my1\frontend\dist\index.html" -Raw

# 写入服务器
Write-Host "上传 index.html..." -ForegroundColor Cyan
Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "echo '$indexContent' > /root/english-learning/frontend/dist/index.html"

# 设置权限
Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "chown www-data:www-data /root/english-learning/frontend/dist/index.html"

# 验证
$result = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "ls -la /root/english-learning/frontend/dist/index.html"
Write-Host $result.Output

Remove-SSHSession -SessionId $sshSession.SessionId

Write-Host "完成!" -ForegroundColor Green
