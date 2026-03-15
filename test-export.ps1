$Server = "http://47.97.185.117"

Write-Host "Testing export API on $Server"

# Create web session
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

# Login
Write-Host "Step 1: Login..."
$loginBody = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "$Server/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -WebSession $session

    Write-Host "Login successful"
    Write-Host "Session cookies: $($session.Cookies.Count)"
} catch {
    Write-Host "Login error: $($_.Exception.Message)"
    exit 1
}

# Test export
Write-Host "`nStep 2: Testing export API..."
try {
    Write-Host "Requesting: $Server/api/admin/export/all"

    $exportResponse = Invoke-RestMethod -Uri "$Server/api/admin/export/all" -Method GET -WebSession $session

    if ($exportResponse.success) {
        Write-Host "Export SUCCESS!"

        $stats = $exportResponse.stats
        Write-Host "  Categories: $($stats.categories)"
        Write-Host "  Lessons: $($stats.lessons)"
        Write-Host "  Words: $($stats.words)"

        $filename = "export-data-$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
        $exportResponse | ConvertTo-Json -Depth 10 | Out-File -FilePath $filename -Encoding UTF8
        Write-Host "  Saved to: $filename"
    } else {
        Write-Host "Export failed: $($exportResponse.message)"
    }
} catch {
    $errorMsg = $_.Exception.Message
    if ($errorMsg -match "404") {
        Write-Host "Export API NOT FOUND (404) - Backend needs update"
    } else {
        Write-Host "Export error: $errorMsg"
    }
}

Write-Host "`nTest completed"
