$server = "47.97.185.117"
$username = "root"
$password = "Admin88868"

$pass = ConvertTo-SecureString $password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential($username, $pass)
$sshSession = New-SSHSession -ComputerName $server -Credential $credential -AcceptKey -ErrorAction Stop

Write-Host "1. Check if git exists on server..."
$result = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "which git"
Write-Host "Git: $($result.Output)"

Write-Host "`n2. Check frontend directory..."
$result2 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "ls -la /root/english-learning/frontend/"
Write-Host $result2.Output

Write-Host "`n3. Check .git..."
$result3 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "ls -la /root/english-learning/.git 2>/dev/null || echo no git"
Write-Host $result3.Output

Remove-SSHSession -SessionId $sshSession.SessionId | Out-Null
