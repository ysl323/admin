# Verify server deployment
Import-Module Posh-SSH

Write-Host "=== Verifying Server Deployment ===" -ForegroundColor Cyan

$password = ConvertTo-SecureString "Admin88868" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential("root", $password)

Write-Host "`nConnecting to server..." -ForegroundColor Yellow
$session = New-SSHSession -ComputerName "47.97.185.117" -Credential $credential -AcceptKey -Force

# Check LearningPage JS file
Write-Host "`nChecking LearningPage JS file..." -ForegroundColor Yellow
$result = Invoke-SSHCommand -SessionId $session.SessionId -Command "ls -lh /root/english-learning/frontend/dist/assets/LearningPage-*.js"
Write-Host $result.Output

# Check for currentLength logic
Write-Host "`nChecking underline logic..." -ForegroundColor Yellow
$result = Invoke-SSHCommand -SessionId $session.SessionId -Command "grep -o 'currentLength' /root/english-learning/frontend/dist/assets/LearningPage-*.js | wc -l"
$currentLengthCount = $result.Output.Trim()
Write-Host "Found currentLength: $currentLengthCount times" -ForegroundColor $(if ($currentLengthCount -gt 0) { "Green" } else { "Red" })

# Check CSS gap
Write-Host "`nChecking CSS gap..." -ForegroundColor Yellow
$result = Invoke-SSHCommand -SessionId $session.SessionId -Command "grep 'gap:-10px' /root/english-learning/frontend/dist/assets/LearningPage-*.css"
if ($result.Output) {
    Write-Host "Found gap:-10px" -ForegroundColor Green
} else {
    Write-Host "Not found gap:-10px" -ForegroundColor Red
}

# Show a snippet of the code
Write-Host "`nCode snippet (placeholder logic):" -ForegroundColor Yellow
$result = Invoke-SSHCommand -SessionId $session.SessionId -Command "grep -A 2 -B 2 'Array(' /root/english-learning/frontend/dist/assets/LearningPage-*.js | head -20"
Write-Host $result.Output

Remove-SSHSession -SessionId $session.SessionId

Write-Host "`n=== Verification Complete ===" -ForegroundColor Cyan
