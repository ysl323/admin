# 部署前端到服务器
Import-Module Posh-SSH

$password = ConvertTo-SecureString "Admin88868" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential("root", $password)

# 1. 备份当前代码
$backupTime = Get-Date -Format "yyyyMMdd_HHmmss"
Write-Host "=== 1. 备份当前代码 ===" -ForegroundColor Cyan
$sshSession = New-SSHSession -ComputerName "47.97.185.117" -Credential $credential -AcceptKey -Force
$result = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "cp -r /root/english-learning/frontend/dist /root/english-learning/frontend/dist-backup-$backupTime && echo 'Backup done'"
Write-Host $result.Output
Remove-SSHSession -SessionId $sshSession.SessionId

# 2. 上传新构建的文件
Write-Host "`n=== 2. 上传新构建的文件 ===" -ForegroundColor Cyan
$sshSession = New-SSHSession -ComputerName "47.97.185.117" -Credential $credential -AcceptKey -Force

# 使用 SCP 上传
$result2 = Invoke-SCPFolder -SessionId $sshSession.SessionId -LocalPath "e:\demo\my1\my1\frontend\dist" -RemotePath "/root/english-learning/frontend/" -Force
Write-Host "上传完成"

# 3. 验证
Write-Host "`n=== 3. 验证部署 ===" -ForegroundColor Cyan
$result3 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "ls -la /root/english-learning/frontend/dist/assets/ | head -10"
Write-Host $result3.Output

# 4. 测试网站
Write-Host "`n=== 4. 测试网站 ===" -ForegroundColor Cyan
$result4 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "curl -s -o /dev/null -w '%{http_code}' http://localhost:80/"
Write-Host "网站返回状态: $($result4.Output)"

Remove-SSHSession -SessionId $sshSession.SessionId

Write-Host "`n=== 部署完成 ===" -ForegroundColor Green
