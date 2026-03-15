$server = "47.97.185.117"
$username = "root"
$password = "Admin88868"

$pass = ConvertTo-SecureString $password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential($username, $pass)
$sshSession = New-SSHSession -ComputerName $server -Credential $credential -AcceptKey -ErrorAction Stop

# Check if directory exists
Write-Host "=== Check directory ==="
$result = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "ls -la /root/english-learning/"
Write-Host $result.Output

Write-Host "`n=== Check frontend src ==="
$result2 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "ls /root/english-learning/frontend/src/views/admin/"
Write-Host $result2.Output

Remove-SSHSession -SessionId $sshSession.SessionId | Out-Null
