# Deploy Multi-Word Input Feature
Import-Module Posh-SSH

Write-Host "=== Deploying Multi-Word Input Feature ===" -ForegroundColor Cyan

# Step 1: Build frontend
Write-Host "`nStep 1: Building frontend..." -ForegroundColor Yellow
Set-Location -Path "my1/frontend"

$buildResult = npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    Set-Location -Path "../.."
    exit 1
}

Set-Location -Path "../.."
Write-Host "Build completed successfully!" -ForegroundColor Green

# Step 2: Upload to server
Write-Host "`nStep 2: Uploading to server..." -ForegroundColor Yellow

$password = ConvertTo-SecureString "Admin88868" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential("root", $password)

# Upload dist folder
Write-Host "Uploading dist folder..." -ForegroundColor Cyan

# Remove old dist folder on server
$session = New-SSHSession -ComputerName "47.97.185.117" `
    -Credential $credential `
    -AcceptKey -Force

Invoke-SSHCommand -SessionId $session.SessionId `
    -Command 'rm -rf /root/english-learning/frontend/dist/*'

# Upload new dist folder
Get-ChildItem -Path "my1/frontend/dist" -Recurse -File | ForEach-Object {
    $relativePath = $_.FullName.Substring((Get-Item "my1/frontend/dist").FullName.Length + 1)
    $destPath = "/root/english-learning/frontend/dist/$($relativePath -replace '\\', '/')"
    $destDir = Split-Path -Parent $destPath
    
    # Create directory if needed
    Invoke-SSHCommand -SessionId $session.SessionId `
        -Command "mkdir -p '$destDir'" | Out-Null
    
    # Upload file
    Set-SCPItem -ComputerName "47.97.185.117" -Credential $credential `
        -Path $_.FullName `
        -Destination $destPath `
        -AcceptKey -Force
}

Remove-SSHSession -SessionId $session.SessionId

Write-Host "Upload completed!" -ForegroundColor Green

# Step 3: Verify deployment
Write-Host "`nStep 3: Verifying deployment..." -ForegroundColor Yellow

$session = New-SSHSession -ComputerName "47.97.185.117" `
    -Credential $credential `
    -AcceptKey -Force

$result = Invoke-SSHCommand -SessionId $session.SessionId `
    -Command 'ls -lh /root/english-learning/frontend/dist/ | head -10'

Write-Host $result.Output

Remove-SSHSession -SessionId $session.SessionId

Write-Host "`n=== Deployment Complete ===" -ForegroundColor Green
Write-Host "Please test the multi-word input feature at: http://47.97.185.117" -ForegroundColor Cyan
Write-Host "`nTest with phrases like:" -ForegroundColor Yellow
Write-Host "  - hello world" -ForegroundColor White
Write-Host "  - good morning" -ForegroundColor White
Write-Host "  - thank you" -ForegroundColor White
