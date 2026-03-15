# Check .env and Fix Database Path

$serverIP = "47.97.185.117"
$username = "root"
$password = "Admin88868"

Import-Module Posh-SSH

try {
    $securePassword = ConvertTo-SecureString $password -AsPlainText -Force
    $credential = New-Object System.Management.Automation.PSCredential($username, $securePassword)

    $session = New-SSHSession -ComputerName $serverIP -Credential $credential -AcceptKey
    
    Write-Host "Checking .env file..." -ForegroundColor Yellow
    $envCheck = Invoke-SSHCommand -SessionId $session.SessionId -Command "cat /root/english-learning/backend/.env | grep DB_STORAGE"
    Write-Host "Current DB_STORAGE: $($envCheck.Output)" -ForegroundColor Gray
    
    if ($envCheck.Output -match "../data/database.sqlite") {
        Write-Host "Database path is correct" -ForegroundColor Green
        
        # Now run init on correct database
        Write-Host "`nRunning TTS init on correct database..." -ForegroundColor Yellow
        $initCmd = "cd /root/english-learning/backend && node init-tts-config.js"
        $initResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $initCmd -TimeOut 30
        Write-Host $initResult.Output
        
        if ($initResult.ExitStatus -eq 0) {
            Write-Host "`nSuccess! Restarting backend..." -ForegroundColor Green
            $restartResult = Invoke-SSHCommand -SessionId $session.SessionId -Command "pm2 restart english-learning-backend"
            Write-Host "Backend restarted" -ForegroundColor Green
            
            # Verify
            Write-Host "`nVerifying configuration..." -ForegroundColor Yellow
            $verifyCmd = "sqlite3 /root/english-learning/data/database.sqlite 'SELECT COUNT(*) FROM config WHERE key LIKE `"volcengine%`";'"
            $verifyResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $verifyCmd
            Write-Host "TTS config entries: $($verifyResult.Output.Trim())" -ForegroundColor White
        }
    } else {
        Write-Host "Database path needs to be fixed" -ForegroundColor Red
    }
    
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
