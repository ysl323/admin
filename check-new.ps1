# 检查服务器上的文件
Import-Module Posh-SSH

$password = ConvertTo-SecureString "Admin88868" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential("root", $password)

$sshSession = New-SSHSession -ComputerName "47.97.185.117" -Credential $credential -AcceptKey -Force

# 查看最新修改的文件
Write-Host "=== 服务器上最新修改的文件 ===" -ForegroundColor Cyan
$result = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "ls -lt /root/english-learning/frontend/dist/assets/ | head -10"
Write-Host $result.Output

# 检查 index.html 时间
Write-Host "`n=== index.html ===" -ForegroundColor Cyan
$result2 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "ls -la /root/english-learning/frontend/dist/index.html"
Write-Host $result2.Output

# 检查 LearningPage 文件
Write-Host "`n=== LearningPage ===" -ForegroundColor Cyan
$result3 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "ls -la /root/english-learning/frontend/dist/assets/ | grep LearningPage"
Write-Host $result3.Output

# 检查 random 关键字
Write-Host "`n=== 检查 random ===" -ForegroundColor Cyan
$result4 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "grep -o 'random' /root/english-learning/frontend/dist/assets/LearningPage*.js | head -3"
Write-Host $result4.Output

Remove-SSHSession -SessionId $sshSession.SessionId
