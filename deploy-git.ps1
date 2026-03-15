# 在服务器上直接 git pull 更新
Import-Module Posh-SSH

$password = ConvertTo-SecureString "Admin88868" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential("root", $password)

$sshSession = New-SSHSession -ComputerName "47.97.185.117" -Credential $credential -AcceptKey -Force

# 1. 备份当前代码
$backupTime = Get-Date -Format "yyyyMMdd_HHmmss"
Write-Host "=== 1. 备份当前代码 ===" -ForegroundColor Cyan
$result = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "cp -r /root/english-learning/frontend/dist /root/english-learning/frontend/dist-backup-$backupTime"
Write-Host "备份完成: dist-backup-$backupTime"

# 2. 检查 git 仓库
Write-Host "`n=== 2. 检查 git 仓库 ===" -ForegroundColor Cyan
$result2 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "ls -la /root/english-learning/.git 2>/dev/null || echo '没有 git 仓库'"
Write-Host $result2.Output

# 3. 如果有 git，执行 pull
Write-Host "`n=== 3. 执行 git pull ===" -ForegroundColor Cyan
$result3 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "cd /root/english-learning && git status"
Write-Host $result3.Output

# 4. 重新构建前端
Write-Host "`n=== 4. 重新构建前端 ===" -ForegroundColor Cyan
$result4 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "cd /root/english-learning/frontend && npm run build 2>&1 | tail -20"
Write-Host $result4.Output

Remove-SSHSession -SessionId $sshSession.SessionId
