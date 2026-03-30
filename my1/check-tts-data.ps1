# Check TTS Data

$serverIP = "47.97.185.117"
$username = "root"
$password = "Admin88868"

Import-Module Posh-SSH

try {
    $securePassword = ConvertTo-SecureString $password -AsPlainText -Force
    $credential = New-Object System.Management.Automation.PSCredential($username, $securePassword)

    $session = New-SSHSession -ComputerName $serverIP -Credential $credential -AcceptKey
    
    Write-Host "Checking TTS configuration in database..." -ForegroundColor Yellow
    Write-Host ""
    
    # Simple count
    $countCmd = "cd /root/english-learning/backend && sqlite3 database.sqlite 'SELECT COUNT(*) FROM config;'"
    $countResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $countCmd
    Write-Host "Total config entries: $($countResult.Output.Trim())" -ForegroundColor White
    
    # List all keys
    $keysCmd = "cd /root/english-learning/backend && sqlite3 database.sqlite 'SELECT key FROM config;'"
    $keysResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $keysCmd
    Write-Host "`nConfig keys:" -ForegroundColor White
    Write-Host $keysResult.Output
    
    # Check specific TTS keys
    $ttsCmd = "cd /root/english-learning/backend && sqlite3 database.sqlite 'SELECT key, substr(value, 1, 20) as value_preview FROM config WHERE key LIKE `"tts%`" OR key LIKE `"volcengine%`" OR key LIKE `"google%`";'"
    $ttsResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $ttsCmd
    Write-Host "`nTTS configuration:" -ForegroundColor White
    Write-Host $ttsResult.Output
    
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
