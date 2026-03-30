# ============================================
# English Learning System - Automated Deployment Script
# One-click deployment without manual intervention
# ============================================

param(
    [switch]$SkipPack = $false
)

# Color output function
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-ColorOutput Green "============================================"
Write-ColorOutput Green "   English Learning System - Auto Deploy"
Write-ColorOutput Green "============================================"
Write-Host ""

# Server configuration
$server = "47.97.185.117"
$username = "root"
$password = ConvertTo-SecureString "Admin88868" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential($username, $password)

try {
    # Step 1: Check package
    if (-not $SkipPack) {
        Write-ColorOutput Cyan "[1/5] Checking deployment package..."
        if (Test-Path "deploy-package.zip") {
            $size = (Get-Item "deploy-package.zip").Length / 1MB
            Write-ColorOutput Green "Package found: $([math]::Round($size, 2)) MB"
        } else {
            Write-ColorOutput Red "ERROR: deploy-package.zip not found"
            exit 1
        }
    } else {
        Write-ColorOutput Yellow "[1/5] Skipping package check"
    }

    # Step 2: Check SSH module
    Write-ColorOutput Cyan "[2/5] Checking SSH module..."
    if (-not (Get-Module -ListAvailable -Name Posh-SSH)) {
        Write-ColorOutput Yellow "Installing Posh-SSH module..."
        Install-Module -Name Posh-SSH -Force -Scope CurrentUser -AllowClobber
    }
    Import-Module Posh-SSH
    Write-ColorOutput Green "SSH module ready"

    # Step 3: Upload files
    Write-ColorOutput Cyan "[3/5] Uploading files to server..."
    
    # Upload deployment package
    Write-Host "Uploading deploy-package.zip..."
    Set-SCPItem -ComputerName $server `
        -Credential $credential `
        -Path ".\deploy-package.zip" `
        -Destination "/root/" `
        -AcceptKey `
        -Force
    
    # Upload deployment script
    Write-Host "Uploading deploy-and-test.sh..."
    Set-SCPItem -ComputerName $server `
        -Credential $credential `
        -Path ".\deploy-and-test.sh" `
        -Destination "/root/" `
        -AcceptKey `
        -Force
    
    Write-ColorOutput Green "Files uploaded successfully"

    # Step 4: Create SSH session
    Write-ColorOutput Cyan "[4/5] Connecting to server..."
    $session = New-SSHSession -ComputerName $server `
        -Credential $credential `
        -AcceptKey `
        -Force
    Write-ColorOutput Green "Connected to server (Session ID: $($session.SessionId))"

    # Step 5: Execute deployment
    Write-ColorOutput Cyan "[5/5] Executing deployment script..."
    
    $deployCommands = @"
cd /root
echo "Setting permissions..."
chmod +x deploy-and-test.sh
echo "Starting deployment..."
bash deploy-and-test.sh
"@

    $result = Invoke-SSHCommand -SessionId $session.SessionId -Command $deployCommands -TimeOut 600

    # Display deployment output
    Write-Host ""
    Write-ColorOutput Yellow "=== Deployment Log ==="
    Write-Host $result.Output
    Write-Host ""

    if ($result.ExitStatus -eq 0) {
        Write-ColorOutput Green "Deployment completed successfully!"
    } else {
        Write-ColorOutput Red "Deployment encountered errors"
        if ($result.Error) {
            Write-Host $result.Error
        }
    }

    # Cleanup session
    Remove-SSHSession -SessionId $session.SessionId

    Write-Host ""
    Write-ColorOutput Green "============================================"
    Write-ColorOutput Green "   Deployment Complete!"
    Write-ColorOutput Green "============================================"
    Write-Host ""
    Write-ColorOutput Cyan "Website URL: http://$server"
    Write-ColorOutput Cyan "Admin Panel: http://$server/admin"
    Write-ColorOutput Yellow "Default Login: admin / admin123"
    Write-Host ""
    
    # Run verification tests
    Write-ColorOutput Cyan "Verifying deployment..."
    Start-Sleep -Seconds 5
    
    try {
        $healthCheck = Invoke-WebRequest -Uri "http://$server/health" -TimeoutSec 10 -UseBasicParsing
        if ($healthCheck.StatusCode -eq 200) {
            Write-ColorOutput Green "Health check passed"
        }
    } catch {
        Write-ColorOutput Yellow "Health check failed - service may still be starting"
    }
    
    try {
        $homepage = Invoke-WebRequest -Uri "http://$server/" -TimeoutSec 10 -UseBasicParsing
        if ($homepage.StatusCode -eq 200) {
            Write-ColorOutput Green "Website is accessible"
        }
    } catch {
        Write-ColorOutput Yellow "Website access failed - please check service status"
    }

} catch {
    Write-ColorOutput Red "Deployment failed: $_"
    Write-Host $_.Exception.Message
    Write-Host $_.ScriptStackTrace
    exit 1
}
