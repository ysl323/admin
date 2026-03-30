$server = "47.97.185.117"
$user = "root"
$password = ConvertTo-SecureString "Admin88868" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential($user, $password)

Write-Host "Connecting to server..." -ForegroundColor Cyan
$session = New-SSHSession -ComputerName $server -Credential $credential -Force -WarningAction SilentlyContinue

if ($session) {
    Write-Host "Connected! Session ID: $($session.SessionId)" -ForegroundColor Green
    
    Write-Host "`nListing CSS files..." -ForegroundColor Yellow
    $cmd1 = Invoke-SSHCommand -SessionId $session.SessionId -Command "ls -lh /var/www/english-learning/dist/assets/ | grep LearningPage"
    $cmd1.Output | ForEach-Object { Write-Host $_ }
    
    Write-Host "`nChecking CSS content..." -ForegroundColor Yellow
    $cmd2 = Invoke-SSHCommand -SessionId $session.SessionId -Command "find /var/www/english-learning/dist/assets/ -name 'LearningPage-*.css' -exec cat {} \; | grep -A 3 underline-placeholder"
    $cmd2.Output | ForEach-Object { Write-Host $_ }
    
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
    Write-Host "`nDisconnected" -ForegroundColor Green
} else {
    Write-Host "Failed to connect" -ForegroundColor Red
}
