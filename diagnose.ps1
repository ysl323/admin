# 诊断网站500错误
$ErrorActionPreference = "Continue"

Write-Host "=== 测试网站 ==="
$urls = @(
    "http://47.97.185.117/",
    "http://47.97.185.117/index.html",
    "http://47.97.185.117/admin/",
    "http://47.97.185.117/api/status"
)

foreach ($url in $urls) {
    try {
        $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5
        Write-Host "$url => $($r.StatusCode)"
    } catch {
        $status = $_.Exception.Response.StatusCode.Value__
        Write-Host "$url => $status"
    }
}

Write-Host "`n=== 检查服务器目录 ==="
Write-Host "尝试连接SSH..."
