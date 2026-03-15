# Create Config Table and Initialize TTS

$serverIP = "47.97.185.117"
$username = "root"
$password = "Admin88868"

Write-Host "Creating Config Table and Initializing TTS..." -ForegroundColor Cyan
Write-Host ""

Import-Module Posh-SSH

try {
    $securePassword = ConvertTo-SecureString $password -AsPlainText -Force
    $credential = New-Object System.Management.Automation.PSCredential($username, $securePassword)

    $session = New-SSHSession -ComputerName $serverIP -Credential $credential -AcceptKey
    
    # Check current tables
    Write-Host "1. Checking existing tables..." -ForegroundColor Yellow
    $tables = Invoke-SSHCommand -SessionId $session.SessionId -Command "cd /root/english-learning/backend && sqlite3 database.sqlite '.tables'"
    Write-Host "   Tables: $($tables.Output)" -ForegroundColor Gray
    
    # Create config table if not exists
    Write-Host "`n2. Creating config table..." -ForegroundColor Yellow
    $createTable = @"
CREATE TABLE IF NOT EXISTS config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
"@
    
    $createResult = Invoke-SSHCommand -SessionId $session.SessionId -Command "cd /root/english-learning/backend && sqlite3 database.sqlite `"$createTable`""
    
    if ($createResult.ExitStatus -eq 0) {
        Write-Host "   Config table created" -ForegroundColor Green
    } else {
        Write-Host "   Error: $($createResult.Error)" -ForegroundColor Red
    }
    
    # Verify table creation
    Write-Host "`n3. Verifying table..." -ForegroundColor Yellow
    $verifyTable = Invoke-SSHCommand -SessionId $session.SessionId -Command "cd /root/english-learning/backend && sqlite3 database.sqlite '.schema config'"
    Write-Host "   $($verifyTable.Output)" -ForegroundColor Gray
    
    # Run TTS initialization
    Write-Host "`n4. Running TTS initialization..." -ForegroundColor Yellow
    $initResult = Invoke-SSHCommand -SessionId $session.SessionId -Command "cd /root/english-learning/backend && node init-tts-config.js" -TimeOut 30
    Write-Host $initResult.Output
    
    if ($initResult.ExitStatus -eq 0) {
        Write-Host "`n   TTS initialization successful!" -ForegroundColor Green
        
        # Restart backend
        Write-Host "`n5. Restarting backend..." -ForegroundColor Yellow
        $restartResult = Invoke-SSHCommand -SessionId $session.SessionId -Command "pm2 restart english-learning-backend"
        Write-Host "   Backend restarted" -ForegroundColor Green
    } else {
        Write-Host "`n   TTS initialization failed!" -ForegroundColor Red
    }
    
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
    
    Write-Host ""
    Write-Host "Done!" -ForegroundColor Green
    
} catch {
    Write-Host ""
    Write-Host "Error: $_" -ForegroundColor Red
}
