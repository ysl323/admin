# 检查服务器上前端代码
Import-Module Posh-SSH

$password = ConvertTo-SecureString "Admin88868" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential("root", $password)

$sshSession = New-SSHSession -ComputerName "47.97.185.117" -Credential $credential -AcceptKey -Force

Write-Host "=== 检查 JS 文件 ===" -ForegroundColor Cyan
$result1 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "ls -la /root/english-learning/frontend/dist/assets/"
Write-Host $result1.Output

Write-Host "`n=== 搜索随机学习 ===" -ForegroundColor Cyan
$result2 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "grep -l '随机学习' /root/english-learning/frontend/dist/assets/*.js 2>/dev/null || echo '未找到'"
Write-Host $result2.Output

Write-Host "`n=== 检查本地代码 ===" -ForegroundColor Cyan
$result3 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "grep -n '随机学习' /root/english-learning/frontend/src/components/LearningModeSelector.vue"
Write-Host $result3.Output

Remove-SSHSession -SessionId $sshSession.SessionId
