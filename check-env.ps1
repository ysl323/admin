Import-Module Posh-SSH

$serverIP = "47.97.185.117"
$username = "root"
$password = "Admin88868"

$securePassword = ConvertTo-SecureString $password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ($username, $securePassword)

Write-Host "Checking environment variables..."

try {
    $session = New-SSHSession -ComputerName $serverIP -Credential $credential -AcceptKey -ErrorAction Stop
    
    # Check PM2 env
    Write-Host "`n=== PM2 Environment Variables ==="
    $envCmd = "pm2 list"
    $envResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $envCmd
    Write-Host $envResult.Output
    
    # Check .env file
    Write-Host "`n=== .env file ==="
    $envFileCmd = "cat /root/english-learning/.env 2>/dev/null || echo 'No .env file'"
    $envFileResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $envFileCmd
    Write-Host $envFileResult.Output
    
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
