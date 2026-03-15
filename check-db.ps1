Import-Module Posh-SSH

$serverIP = "47.97.185.117"
$username = "root"
$password = "Admin88868"

$securePassword = ConvertTo-SecureString $password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ($username, $securePassword)

Write-Host "Connecting to server..."

try {
    $session = New-SSHSession -ComputerName $serverIP -Credential $credential -AcceptKey -ErrorAction Stop
    
    # Check table schema
    Write-Host "`n=== Table Schema ==="
    $schemaCmd = "sqlite3 /root/english-learning/backend/database.sqlite '.schema config'"
    $schemaResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $schemaCmd
    Write-Host $schemaResult.Output
    
    # Check all data
    Write-Host "`n=== All Config Data ==="
    $dataCmd = "sqlite3 /root/english-learning/backend/database.sqlite 'SELECT * FROM config;'"
    $dataResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $dataCmd
    Write-Host $dataResult.Output
    
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
