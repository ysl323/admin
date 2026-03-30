# Check Both Databases

$serverIP = "47.97.185.117"
$username = "root"
$password = "Admin88868"

Import-Module Posh-SSH

try {
    $securePassword = ConvertTo-SecureString $password -AsPlainText -Force
    $credential = New-Object System.Management.Automation.PSCredential($username, $securePassword)

    $session = New-SSHSession -ComputerName $serverIP -Credential $credential -AcceptKey
    
    Write-Host "Checking both database files..." -ForegroundColor Cyan
    Write-Host ""
    
    # Check backend database
    Write-Host "1. Backend database (/root/english-learning/backend/database.sqlite):" -ForegroundColor Yellow
    $backendTables = Invoke-SSHCommand -SessionId $session.SessionId -Command "sqlite3 /root/english-learning/backend/database.sqlite '.tables'"
    Write-Host "   Tables: $($backendTables.Output)" -ForegroundColor Gray
    
    $backendConfig = Invoke-SSHCommand -SessionId $session.SessionId -Command "sqlite3 /root/english-learning/backend/database.sqlite 'SELECT COUNT(*) FROM config;' 2>/dev/null || echo '0'"
    Write-Host "   Config entries: $($backendConfig.Output.Trim())" -ForegroundColor Gray
    
    # Check data database
    Write-Host "`n2. Data database (/root/english-learning/data/database.sqlite):" -ForegroundColor Yellow
    $dataTables = Invoke-SSHCommand -SessionId $session.SessionId -Command "sqlite3 /root/english-learning/data/database.sqlite '.tables'"
    Write-Host "   Tables: $($dataTables.Output)" -ForegroundColor Gray
    
    $dataUsers = Invoke-SSHCommand -SessionId $session.SessionId -Command "sqlite3 /root/english-learning/data/database.sqlite 'SELECT COUNT(*) FROM users;' 2>/dev/null || echo '0'"
    Write-Host "   Users: $($dataUsers.Output.Trim())" -ForegroundColor Gray
    
    # Check which one backend is using
    Write-Host "`n3. Checking backend process..." -ForegroundColor Yellow
    $lsofCmd = "lsof -p `$(pgrep -f 'node.*english-learning') 2>/dev/null | grep database.sqlite || echo 'Not found'"
    $lsofResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $lsofCmd
    Write-Host "   $($lsofResult.Output)" -ForegroundColor Gray
    
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
