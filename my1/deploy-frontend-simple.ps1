# Simple Frontend Deployment
Import-Module Posh-SSH

Write-Host "=== Deploying Frontend ===" -ForegroundColor Cyan

$password = ConvertTo-SecureString "Admin88868" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential("root", $password)

Write-Host "`nConnecting to server..." -ForegroundColor Yellow
$session = New-SSHSession -ComputerName "47.97.185.117" `
    -Credential $credential `
    -AcceptKey -Force

Write-Host "Creating backup and cleaning dist folder..." -ForegroundColor Yellow
Invoke-SSHCommand -SessionId $session.SessionId `
    -Command 'cd /root/english-learning/frontend && rm -rf dist.backup && mv dist dist.backup && mkdir -p dist/assets'

Write-Host "`nUploading index.html..." -ForegroundColor Cyan
Set-SCPItem -ComputerName "47.97.185.117" -Credential $credential `
    -Path "frontend/dist/index.html" `
    -Destination "/root/english-learning/frontend/dist/" `
    -AcceptKey -Force

Write-Host "Uploading assets..." -ForegroundColor Cyan
Get-ChildItem "frontend/dist/assets" | ForEach-Object {
    Write-Host "  Uploading $($_.Name)..." -ForegroundColor Gray
    Set-SCPItem -ComputerName "47.97.185.117" -Credential $credential `
        -Path $_.FullName `
        -Destination "/root/english-learning/frontend/dist/assets/" `
        -AcceptKey -Force
}

Write-Host "`nVerifying deployment..." -ForegroundColor Yellow
$result = Invoke-SSHCommand -SessionId $session.SessionId `
    -Command 'ls -lh /root/english-learning/frontend/dist/ && ls /root/english-learning/frontend/dist/assets/ | wc -l'

Write-Host $result.Output

Remove-SSHSession -SessionId $session.SessionId

Write-Host "`n=== Deployment Complete ===" -ForegroundColor Green
Write-Host "Frontend deployed successfully!" -ForegroundColor Green
Write-Host "`nTest at: http://47.97.185.117" -ForegroundColor Cyan
