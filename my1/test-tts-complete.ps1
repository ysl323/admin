Import-Module Posh-SSH

$password = ConvertTo-SecureString "Admin88868" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential("root", $password)

Write-Host "=== Complete TTS Test ===" -ForegroundColor Cyan

Write-Host "`nUploading test script..." -ForegroundColor Yellow
Set-SCPItem -ComputerName "47.97.185.117" -Credential $credential `
    -Path ".\my1\backend\test-tts-complete.js" `
    -Destination "/root/english-learning/backend/" `
    -AcceptKey -Force

Write-Host "Connecting to server and running test..." -ForegroundColor Yellow
$session = New-SSHSession -ComputerName "47.97.185.117" `
    -Credential $credential `
    -AcceptKey -Force

$result = Invoke-SSHCommand -SessionId $session.SessionId -TimeOut 20 `
    -Command 'cd /root/english-learning/backend && timeout 15 node test-tts-complete.js'

Write-Host "`n=== Test Result ===" -ForegroundColor Cyan
Write-Host $result.Output

if ($result.ExitStatus -eq 0) {
    Write-Host "`nTTS is working!" -ForegroundColor Green
} else {
    Write-Host "`nTTS test failed" -ForegroundColor Red
    if ($result.Error) {
        Write-Host "Error:" -ForegroundColor Red
        Write-Host $result.Error
    }
    
    Write-Host "`nChecking backend logs..." -ForegroundColor Yellow
    $logs = Invoke-SSHCommand -SessionId $session.SessionId `
        -Command 'pm2 logs english-learning-backend --lines 20 --nostream'
    Write-Host $logs.Output
}

Remove-SSHSession -SessionId $session.SessionId
Write-Host "`nDone" -ForegroundColor Green
