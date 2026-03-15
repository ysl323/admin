$server = "47.97.185.117"
$username = "root"
$password = "Admin88868"

$pass = ConvertTo-SecureString $password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential($username, $pass)
$sshSession = New-SSHSession -ComputerName $server -Credential $credential -AcceptKey -ErrorAction Stop

Write-Host "=== Frontend src ==="
$result = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "ls -la /root/english-learning/frontend/src/"
Write-Host $result.Output

Write-Host "`n=== Views ==="
$result2 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "ls -la /root/english-learning/frontend/src/views/"
Write-Host $result2.Output

Write-Host "`n=== Admin views ==="
$result3 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "ls -la /root/english-learning/frontend/src/views/admin/"
Write-Host $result3.Output

Remove-SSHSession -SessionId $sshSession.SessionId | Out-Null
