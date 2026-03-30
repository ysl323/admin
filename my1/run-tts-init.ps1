# Run TTS initialization

$serverIP = "47.97.185.117"
$username = "root"
$password = "Admin88868"

Import-Module Posh-SSH

try {
    $securePassword = ConvertTo-SecureString $password -AsPlainText -Force
    $credential = New-Object System.Management.Automation.PSCredential($username, $securePassword)

    Write-Host "Connecting to server..." -ForegroundColor Yellow
    $session = New-SSHSession -ComputerName $serverIP -Credential $credential -AcceptKey
    
    Write-Host "Running initialization script..." -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Gray
    
    # Run initialization script
    $stream = New-SSHShellStream -SessionId $session.SessionId
    
    $stream.WriteLine("cd /root/english-learning/backend")
    Start-Sleep -Seconds 1
    
    $stream.WriteLine("node init-tts-config.js")
    Start-Sleep -Seconds 3
    
    $output = $stream.Read()
    Write-Host $output
    
    Write-Host "========================================" -ForegroundColor Gray
    
    # Check configuration
    Write-Host "`nChecking configuration..." -ForegroundColor Yellow
    $sqlCmd = 'sqlite3 database.sqlite "SELECT COUNT(*) FROM config WHERE key LIKE ' + "'%volcengine%'" + ' OR key LIKE ' + "'%google%'" + ';"'
    $stream.WriteLine($sqlCmd)
    Start-Sleep -Seconds 1
    $countOutput = $stream.Read()
    Write-Host $countOutput
    
    # Restart backend
    Write-Host "`nRestarting backend service..." -ForegroundColor Yellow
    $stream.WriteLine("pm2 restart english-learning-backend")
    Start-Sleep -Seconds 2
    $restartOutput = $stream.Read()
    Write-Host $restartOutput
    
    $stream.Dispose()
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
    
    Write-Host "`nDone!" -ForegroundColor Green
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
