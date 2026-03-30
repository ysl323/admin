# 简单修复TTS配置
$server = "47.97.185.117"
$username = "root"
$password = "Admin88868"

Write-Host "=== 修复TTS配置 ===" -ForegroundColor Cyan

try {
    $secPassword = ConvertTo-SecureString $password -AsPlainText -Force
    $credential = New-Object System.Management.Automation.PSCredential($username, $secPassword)
    
    Write-Host "连接服务器..." -ForegroundColor Yellow
    $session = New-SSHSession -ComputerName $server -Credential $credential -AcceptKey
    
    # 读取本地修复脚本
    $scriptContent = Get-Content "backend/fix-tts-config-now.js" -Raw -Encoding UTF8
    
    Write-Host "上传修复脚本..." -ForegroundColor Yellow
    # 使用cat创建文件
    $escapedContent = $scriptContent -replace "'", "'\\''"
    $cmd = "cat > /root/english-learning/backend/fix-tts-config-now.js << 'EOFMARKER'`n$scriptContent`nEOFMARKER"
    Invoke-SSHCommand -SessionId $session.SessionId -Command $cmd | Out-Null
    
    Write-Host "执行修复..." -ForegroundColor Yellow
    $result = Invoke-SSHCommand -SessionId $session.SessionId -Command "cd /root/english-learning/backend && node fix-tts-config-now.js"
    Write-Host $result.Output
    
    if ($result.ExitStatus -eq 0) {
        Write-Host "`n重启后端..." -ForegroundColor Yellow
        Invoke-SSHCommand -SessionId $session.SessionId -Command "pm2 restart english-learning-backend" | Out-Null
        Start-Sleep -Seconds 3
        
        Write-Host "`n✅ 修复完成!" -ForegroundColor Green
        Write-Host "`n测试TTS:" -ForegroundColor Cyan
        Write-Host "  访问: http://47.97.185.117/admin" -ForegroundColor White
        Write-Host "  配置管理 > 火山引擎TTS > 测试连接" -ForegroundColor White
    } else {
        Write-Host "`n❌ 修复失败" -ForegroundColor Red
    }
    
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
    
} catch {
    Write-Host "错误: $_" -ForegroundColor Red
}
