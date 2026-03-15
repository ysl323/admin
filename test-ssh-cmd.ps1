$server = "47.97.185.117"
$username = "root"
$password = "Admin88868"

$pass = ConvertTo-SecureString $password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential($username, $pass)
$sshSession = New-SSHSession -ComputerName $server -Credential $credential -AcceptKey -ErrorAction Stop

$result = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "echo test"
Write-Host "Result: $($result.Output)"
Write-Host "Exit: $($result.ExitStatus)"

Remove-SSHSession -SessionId $sshSession.SessionId | Out-Null
