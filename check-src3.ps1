$server = "47.97.185.117"
$username = "root"
$password = "Admin88868"

$pass = ConvertTo-SecureString $password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential($username, $pass)
$sshSession = New-SSHSession -ComputerName $server -Credential $credential -AcceptKey -ErrorAction Stop

$result = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "test -d /root/english-learning/frontend/src && echo exists || echo not exists"
Write-Host "src dir: $($result.Output)"

$result2 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "test -d /root/english-learning/frontend/dist && echo exists || echo not exists"
Write-Host "dist dir: $($result2.Output)"

$result3 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "find /root/english-learning/frontend -name 'ContentManagement.vue' 2>/dev/null"
Write-Host "ContentManagement: $($result3.Output)"

Remove-SSHSession -SessionId $sshSession.SessionId | Out-Null
