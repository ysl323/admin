$server = "47.97.185.117"
$username = "root"
$password = "Admin88868"

$pass = ConvertTo-SecureString $password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential($username, $pass)
$sshSession = New-SSHSession -ComputerName $server -Credential $credential -AcceptKey -ErrorAction Stop

# 检查git状态
Write-Host "=== Git状态 ==="
$result = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "cd /root/english-learning && git status"
Write-Host $result.Output

Write-Host "`n=== Git日志 ==="
$result2 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "cd /root/english-learning && git log --oneline -3"
Write-Host $result2.Output

Write-Host "`n=== Git远程 ==="
$result3 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "cd /root/english-learning && git remote -v"
Write-Host $result3.Output

Remove-SSHSession -SessionId $sshSession.SessionId | Out-Null
