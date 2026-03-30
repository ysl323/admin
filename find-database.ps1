# Find Database File

$serverIP = "47.97.185.117"
$username = "root"
$password = "Admin88868"

Import-Module Posh-SSH

try {
    $securePassword = ConvertTo-SecureString $password -AsPlainText -Force
    $credential = New-Object System.Management.Automation.PSCredential($username, $securePassword)

    $session = New-SSHSession -ComputerName $serverIP -Credential $credential -AcceptKey
    
    Write-Host "Finding database files..." -ForegroundColor Yellow
    Write-Host ""
    
    # Find all sqlite files
    $findCmd = "find /root/english-learning -name '*.sqlite' -o -name '*.db'"
    $findResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $findCmd
    Write-Host "Database files found:" -ForegroundColor White
    Write-Host $findResult.Output
    
    # Check backend directory
    Write-Host "`nBackend directory contents:" -ForegroundColor White
    $lsCmd = "ls -lh /root/english-learning/backend/*.sqlite /root/english-learning/backend/*.db 2>/dev/null || echo 'No database files'"
    $lsResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $lsCmd
    Write-Host $lsResult.Output
    
    # Check database config in code
    Write-Host "`nDatabase config in code:" -ForegroundColor White
    $configCmd = "grep -r 'database.sqlite' /root/english-learning/backend/src/config/ 2>/dev/null || echo 'Not found'"
    $configResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $configCmd
    Write-Host $configResult.Output
    
    # Check .env file
    Write-Host "`n.env file:" -ForegroundColor White
    $envCmd = "cat /root/english-learning/backend/.env | grep -i database"
    $envResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $envCmd
    Write-Host $envResult.Output
    
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
