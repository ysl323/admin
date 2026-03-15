# 使用 scp 命令上传文件
Import-Module Posh-SSH

$password = ConvertTo-SecureString "Admin88868" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential("root", $password)

# 先备份
$backupTime = Get-Date -Format "yyyyMMdd_HHmmss"
Write-Host "=== 1. 备份当前代码 ===" -ForegroundColor Cyan
$sshSession = New-SSHSession -ComputerName "47.97.185.117" -Credential $credential -AcceptKey -Force
$result = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "cp -r /root/english-learning/frontend/dist /root/english-learning/frontend/dist-backup-$backupTime && echo 'Backup done'"
Write-Host $result.Output
Remove-SSHSession -SessionId $sshSession.SessionId

# 上传 index.html
Write-Host "`n=== 2. 上传 index.html ===" -ForegroundColor Cyan
scp -o StrictHostKeyChecking=no "e:\demo\my1\my1\frontend\dist\index.html" "root@47.97.185.117:/root/english-learning/frontend/dist/"
Write-Host "index.html 上传完成"

# 上传 assets 目录
Write-Host "`n=== 3. 上传 assets 目录 ===" -ForegroundColor Cyan
scp -o StrictHostKeyChecking=no -r "e:\demo\my1\my1\frontend\dist\assets\*" "root@47.97.185.117:/root/english-learning/frontend/dist/assets/"
Write-Host "assets 上传完成"

# 验证
Write-Host "`n=== 4. 验证 ===" -ForegroundColor Cyan
$sshSession = New-SSHSession -ComputerName "47.97.185.117" -Credential $credential -AcceptKey -Force
$result2 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "ls -la /root/english-learning/frontend/dist/assets/ | head -10"
Write-Host $result2.Output

$result3 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "curl -s -o /dev/null -w '%{http_code}' http://localhost:80/"
Write-Host "网站返回状态: $($result3.Output)"
Remove-SSHSession -SessionId $sshSession.SessionId

Write-Host "`n=== 部署完成 ===" -ForegroundColor Green
