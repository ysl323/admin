Import-Module Posh-SSH

$serverIP = "47.97.185.117"
$username = "root"
$password = "Admin88868"

$securePassword = ConvertTo-SecureString $password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ($username, $securePassword)

Write-Host "Connecting to server..."

try {
    $session = New-SSHSession -ComputerName $serverIP -Credential $credential -AcceptKey -ErrorAction Stop
    Write-Host "Connected!"
    
    # Check TTS config - use different approach
    Write-Host "`n=== TTS Config in DB ==="
    $result = Invoke-SSHCommand -SessionId $session.SessionId -Command "cd /root/english-learning/backend && sqlite3 database.sqlite 'SELECT * FROM config;'"
    Write-Host $result.Output
    
    # Disconnect
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
