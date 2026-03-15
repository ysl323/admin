Import-Module Posh-SSH

$serverIP = "47.97.185.117"
$username = "root"
$password = "Admin88868"

$securePassword = ConvertTo-SecureString $password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ($username, $securePassword)

$session = New-SSHSession -ComputerName $serverIP -Credential $credential -AcceptKey
$result = Invoke-SSHCommand -SessionId $session.SessionId -Command "pm2 logs english-learning-backend --lines 50 --nostream"
Write-Host $result.Output
Remove-SSHSession -SessionId $session.SessionId
