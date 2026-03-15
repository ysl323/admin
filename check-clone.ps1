$server = "47.97.185.117"
$username = "root"
$password = "Admin88868"

$pass = ConvertTo-SecureString $password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential($username, $pass)
$sshSession = New-SSHSession -ComputerName $server -Credential $credential -AcceptKey -ErrorAction Stop

Write-Host "Checking cloned repo..."
$result = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "ls -la /root/english-learning-new/"
Write-Host $result.Output

Write-Host "`nGit log..."
$result2 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "cd /root/english-learning-new && git log --oneline -3"
Write-Host $result2.Output

Remove-SSHSession -SessionId $sshSession.SessionId | Out-Null
