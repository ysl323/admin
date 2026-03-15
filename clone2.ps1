$server = "47.97.185.117"
$username = "root"
$password = "Admin88868"

$pass = ConvertTo-SecureString $password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential($username, $pass)
$sshSession = New-SSHSession -ComputerName $server -Credential $credential -AcceptKey -ErrorAction Stop

Write-Host "Cloning..."
$cmd = "cd /root && rm -rf english-learning-new && git clone https://github.com/ysl323/admin.git english-learning-new 2>&1"
$result = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command $cmd
Write-Host "Output: $($result.Output)"
Write-Host "Error: $($result.Error)"
Write-Host "Exit: $($result.ExitStatus)"

Write-Host "`nChecking..."
$result2 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "ls -la /root/english-learning-new/ 2>&1"
Write-Host $result2.Output

Remove-SSHSession -SessionId $sshSession.SessionId | Out-Null
