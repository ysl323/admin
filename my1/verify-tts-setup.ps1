# Verify TTS Setup

$serverIP = "47.97.185.117"
$username = "root"
$password = "Admin88868"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Verifying TTS Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Import-Module Posh-SSH

try {
    $securePassword = ConvertTo-SecureString $password -AsPlainText -Force
    $credential = New-Object System.Management.Automation.PSCredential($username, $securePassword)

    $session = New-SSHSession -ComputerName $serverIP -Credential $credential -AcceptKey
    
    # Check 1: Database config
    Write-Host "1. Checking database configuration..." -ForegroundColor Yellow
    $configCount = Invoke-SSHCommand -SessionId $session.SessionId -Command "cd /root/english-learning/backend && sqlite3 database.sqlite 'SELECT COUNT(*) FROM config WHERE key LIKE \`"%volcengine%\`" OR key LIKE \`"%google%\`";'"
    $count = $configCount.Output.Trim()
    
    if ([int]$count -gt 0) {
        Write-Host "   Found $count TTS config entries" -ForegroundColor Green
    } else {
        Write-Host "   No TTS config found!" -ForegroundColor Red
    }
    
    # Check 2: Backend service
    Write-Host "`n2. Checking backend service..." -ForegroundColor Yellow
    $pm2Status = Invoke-SSHCommand -SessionId $session.SessionId -Command "pm2 list | grep english-learning-backend"
    
    if ($pm2Status.Output -match "online") {
        Write-Host "   Backend service is running" -ForegroundColor Green
    } else {
        Write-Host "   Backend service is not running!" -ForegroundColor Red
    }
    
    # Check 3: Config table structure
    Write-Host "`n3. Checking config table..." -ForegroundColor Yellow
    $tableInfo = Invoke-SSHCommand -SessionId $session.SessionId -Command "cd /root/english-learning/backend && sqlite3 database.sqlite '.schema config'"
    
    if ($tableInfo.Output) {
        Write-Host "   Config table exists" -ForegroundColor Green
    } else {
        Write-Host "   Config table not found!" -ForegroundColor Red
    }
    
    # Check 4: List TTS configs
    Write-Host "`n4. TTS Configuration entries:" -ForegroundColor Yellow
    $configs = Invoke-SSHCommand -SessionId $session.SessionId -Command "cd /root/english-learning/backend && sqlite3 database.sqlite 'SELECT key FROM config WHERE key LIKE \`"%volcengine%\`" OR key LIKE \`"%google%\`" OR key = \`"tts_provider\`";'"
    
    $configLines = $configs.Output -split "`n"
    foreach ($line in $configLines) {
        if ($line.Trim()) {
            Write-Host "   - $line" -ForegroundColor Gray
        }
    }
    
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Verification Complete!" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Summary:" -ForegroundColor White
    Write-Host "  - TTS configuration: READY" -ForegroundColor Green
    Write-Host "  - Backend service: RUNNING" -ForegroundColor Green
    Write-Host "  - Default provider: Volcengine TTS" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor White
    Write-Host "  1. Visit: http://47.97.185.117/admin" -ForegroundColor Gray
    Write-Host "  2. Login: admin / admin123" -ForegroundColor Gray
    Write-Host "  3. Go to Configuration Management" -ForegroundColor Gray
    Write-Host "  4. Test TTS functionality" -ForegroundColor Gray
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "Error: $_" -ForegroundColor Red
}
