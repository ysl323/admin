# 修复TTS配置并重启后端
$server = "47.97.185.117"
$username = "root"
$password = "Admin88868"

Write-Host "=== 修复TTS配置 ===" -ForegroundColor Cyan

try {
    $secPassword = ConvertTo-SecureString $password -AsPlainText -Force
    $credential = New-Object System.Management.Automation.PSCredential($username, $secPassword)
    
    Write-Host "`n1. 连接服务器..." -ForegroundColor Yellow
    $session = New-SSHSession -ComputerName $server -Credential $credential -AcceptKey
    
    Write-Host "2. 上传修复脚本..." -ForegroundColor Yellow
    $localFile = "backend/fix-tts-config-now.js"
    $remoteFile = "/root/english-learning/backend/fix-tts-config-now.js"
    
    # 读取本地文件
    $content = Get-Content $localFile -Raw -Encoding UTF8
    
    # 创建临时文件
    $tempFile = [System.IO.Path]::GetTempFileName()
    $content | Out-File -FilePath $tempFile -Encoding UTF8 -NoNewline
    
    # 上传文件
    $scpResult = Set-SCPItem -ComputerName $server -Credential $credential -Path $tempFile -Destination $remoteFile -AcceptKey -Force
    Remove-Item $tempFile
    
    Write-Host "3. 执行修复脚本..." -ForegroundColor Yellow
    $result = Invoke-SSHCommand -SessionId $session.SessionId -Command "cd /root/english-learning/backend && node fix-tts-config-now.js"
    Write-Host $result.Output
    
    if ($result.ExitStatus -eq 0) {
        Write-Host "`n4. 重启后端服务..." -ForegroundColor Yellow
        $result = Invoke-SSHCommand -SessionId $session.SessionId -Command "pm2 restart english-learning-backend"
        Write-Host $result.Output
        
        Write-Host "`n等待服务启动..." -ForegroundColor Yellow
        Start-Sleep -Seconds 3
        
        Write-Host "`n5. 检查服务状态..." -ForegroundColor Yellow
        $result = Invoke-SSHCommand -SessionId $session.SessionId -Command "pm2 status"
        Write-Host $result.Output
        
        Write-Host "`n✅ 修复完成!" -ForegroundColor Green
        Write-Host "`n现在可以测试TTS功能了:" -ForegroundColor Cyan
        Write-Host "  访问: http://47.97.185.117/admin" -ForegroundColor White
        Write-Host "  进入配置管理 > 火山引擎TTS > 点击测试连接" -ForegroundColor White
    } else {
        Write-Host "`n❌ 修复失败" -ForegroundColor Red
        Write-Host $result.Error
    }
    
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
    
} catch {
    Write-Host "`n错误: $_" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
