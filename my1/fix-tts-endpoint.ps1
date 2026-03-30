# 修复 TTS Endpoint
Import-Module Posh-SSH

$password = ConvertTo-SecureString "Admin88868" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential("root", $password)

Write-Host "修复 TTS Endpoint..." -ForegroundColor Cyan

Set-SCPItem -ComputerName "47.97.185.117" -Credential $credential `
    -Path ".\my1\backend\fix-tts-endpoint.js" `
    -Destination "/root/english-learning/backend/" `
    -AcceptKey -Force

$session = New-SSHSession -ComputerName "47.97.185.117" `
    -Credential $credential `
    -AcceptKey -Force

$result = Invoke-SSHCommand -SessionId $session.SessionId `
    -Command 'cd /root/english-learning/backend && node fix-tts-endpoint.js'

Write-Host $result.Output

if ($result.ExitStatus -eq 0) {
    Write-Host "`n重启后端..." -ForegroundColor Cyan
    $restart = Invoke-SSHCommand -SessionId $session.SessionId `
        -Command 'pm2 restart english-learning-backend'
    Write-Host $restart.Output
    
    Write-Host "`n✅ 完成" -ForegroundColor Green
}

Remove-SSHSession -SessionId $session.SessionId
