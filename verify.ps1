$server = "47.97.185.117"
$username = "root"
$password = "Admin88868"

$pass = ConvertTo-SecureString $password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential($username, $pass)
$sshSession = New-SSHSession -ComputerName $server -Credential $credential -AcceptKey -ErrorAction Stop

# 1. 检查源代码
Write-Host "=== 检查源代码 ==="
$result = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "grep '一键导出' /root/english-learning/frontend/src/views/admin/ContentManagement.vue"
Write-Host "源代码: $($result.Output)"

# 2. 检查打包后的JS
Write-Host "`n=== 检查打包后的JS ==="
$result2 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "ls -la /root/english-learning/frontend/dist/assets/ContentManagement*.js | head -3"
Write-Host "JS文件: $($result2.Output)"

# 3. 检查最新的JS文件内容
$result3 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "strings /root/english-learning/frontend/dist/assets/ContentManagement-*.js | grep -i export | head -5"
Write-Host "导出功能: $($result3.Output)"

Remove-SSHSession -SessionId $sshSession.SessionId | Out-Null
