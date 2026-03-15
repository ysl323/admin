Import-Module Posh-SSH

$serverIP = "47.97.185.117"
$username = "root"
$password = "Admin88868"

$securePassword = ConvertTo-SecureString $password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ($username, $securePassword)

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupPath = "/root/english-learning-backup-$timestamp"

Write-Host "=== Creating server backup ==="
Write-Host "Backup path: $backupPath"

try {
    $session = New-SSHSession -ComputerName $serverIP -Credential $credential -AcceptKey -ErrorAction Stop
    Write-Host "Connected!"
    
    # Create backup
    Write-Host "`nCopying files..."
    $copyCmd = "cp -r /root/english-learning $backupPath"
    $copyResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $copyCmd
    Write-Host "Copy result: $($copyResult.ExitStatus)"
    
    # Verify backup
    Write-Host "`nVerifying backup..."
    $verifyCmd = "ls -la $backupPath | head -20"
    $verifyResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $verifyCmd
    Write-Host $verifyResult.Output
    
    # Backup database
    Write-Host "`nBacking up database..."
    $dbCmd = "cp /root/english-learning/backend/database.sqlite $backupPath/database-backup-$timestamp.sqlite"
    Invoke-SSHCommand -SessionId $session.SessionId -Command $dbCmd | Out-Null
    
    # Show backup info
    Write-Host "`n=== Backup Complete ==="
    Write-Host "Backup location: $backupPath"
    Write-Host "To restore: cp -r $backupPath/* /root/english-learning/"
    
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
