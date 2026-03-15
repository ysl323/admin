$server = "47.97.185.117"
$username = "root"
$password = "Admin88868"

$pass = ConvertTo-SecureString $password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential($username, $pass)
$sshSession = New-SSHSession -ComputerName $server -Credential $credential -AcceptKey -ErrorAction Stop

Write-Host "1. Cloning from GitHub..."
$result = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "cd /root && rm -rf english-learning-new && git clone https://github.com/ysl323/admin.git english-learning-new"
Write-Host $result.Output

Write-Host "`n2. Checking cloned files..."
$result2 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "ls /root/english-learning-new/"
Write-Host $result2.Output

Remove-SSHSession -SessionId $sshSession.SessionId | Out-Null
