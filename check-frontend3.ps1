# 检查打包后的 LearningPage
Import-Module Posh-SSH

$password = ConvertTo-SecureString "Admin88868" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential("root", $password)

$sshSession = New-SSHSession -ComputerName "47.97.185.117" -Credential $credential -AcceptKey -Force

Write-Host "=== 检查 LearningPage 打包文件 ===" -ForegroundColor Cyan
$result1 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "grep -o 'random' /root/english-learning/frontend/dist/assets/LearningPage-iSE8g-O8.js | head -10"
Write-Host "random 出现次数: $($result1.Output)"

Write-Host "`n=== 检查 compact 模式 ===" -ForegroundColor Cyan
$result2 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "grep -o 'compact' /root/english-learning/frontend/dist/assets/LearningPage-iSE8g-O8.js | head -5"
Write-Host "compact 出现次数: $($result2.Output)"

Write-Host "`n=== 检查模式选择器 ===" -ForegroundColor Cyan
$result3 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "grep -o 'SEQUENTIAL\|LOOP\|RANDOM' /root/english-learning/frontend/dist/assets/LearningPage-iSE8g-O8.js | sort | uniq -c"
Write-Host $result3.Output

Remove-SSHSession -SessionId $sshSession.SessionId
