# Fix TTS initialization

$serverIP = "47.97.185.117"
$username = "root"
$password = "Admin88868"

Import-Module Posh-SSH

try {
    $securePassword = ConvertTo-SecureString $password -AsPlainText -Force
    $credential = New-Object System.Management.Automation.PSCredential($username, $securePassword)

    Write-Host "Connecting to server..." -ForegroundColor Yellow
    $session = New-SSHSession -ComputerName $serverIP -Credential $credential -AcceptKey
    
    # Check database tables
    Write-Host "`nChecking database tables..." -ForegroundColor Yellow
    $checkTables = Invoke-SSHCommand -SessionId $session.SessionId -Command "cd /root/english-learning/backend && sqlite3 database.sqlite '.tables'"
    Write-Host $checkTables.Output
    
    # Upload correct script using base64
    Write-Host "`nUploading initialization script..." -ForegroundColor Yellow
    $scriptContent = Get-Content "backend\init-tts-config.js" -Raw -Encoding UTF8
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($scriptContent)
    $base64 = [Convert]::ToBase64String($bytes)
    
    $uploadCmd = "echo '$base64' | base64 -d > /root/english-learning/backend/init-tts-config.js"
    $uploadResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $uploadCmd
    
    if ($uploadResult.ExitStatus -eq 0) {
        Write-Host "Script uploaded successfully" -ForegroundColor Green
    } else {
        Write-Host "Upload failed: $($uploadResult.Error)" -ForegroundColor Red
        exit 1
    }
    
    # Run initialization
    Write-Host "`nRunning initialization..." -ForegroundColor Yellow
    $initResult = Invoke-SSHCommand -SessionId $session.SessionId -Command "cd /root/english-learning/backend && node init-tts-config.js" -TimeOut 30
    Write-Host $initResult.Output
    
    if ($initResult.ExitStatus -eq 0) {
        Write-Host "`nInitialization successful!" -ForegroundColor Green
        
        # Restart backend
        Write-Host "`nRestarting backend..." -ForegroundColor Yellow
        $restartResult = Invoke-SSHCommand -SessionId $session.SessionId -Command "pm2 restart english-learning-backend"
        Write-Host $restartResult.Output
    } else {
        Write-Host "`nInitialization failed!" -ForegroundColor Red
        Write-Host $initResult.Error
    }
    
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
