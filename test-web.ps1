# 测试网站
try {
    $response = Invoke-WebRequest -Uri "http://47.97.185.117/" -UseBasicParsing -TimeoutSec 10
    Write-Host "状态码: $($response.StatusCode)"
    Write-Host "标题: $($response.Content -match '<title>(.*)</title>' | Out-Null; $Matches[1])"
} catch {
    Write-Host "错误: $($_.Exception.Message)"
}
