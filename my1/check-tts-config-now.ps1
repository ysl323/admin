# 检查TTS配置
$server = "47.97.185.117"
$username = "root"
$password = "Admin88868"

Write-Host "=== 检查TTS配置 ===" -ForegroundColor Cyan

try {
    $secPassword = ConvertTo-SecureString $password -AsPlainText -Force
    $credential = New-Object System.Management.Automation.PSCredential($username, $secPassword)
    
    $session = New-SSHSession -ComputerName $server -Credential $credential -AcceptKey
    
    Write-Host "`n1. 检查数据库中的TTS配置..." -ForegroundColor Yellow
    $result = Invoke-SSHCommand -SessionId $session.SessionId -Command @"
sqlite3 /root/english-learning/data/database.sqlite "SELECT key, CASE WHEN key LIKE '%api_key%' OR key LIKE '%secret%' THEN substr(value, 1, 20) || '...' ELSE value END as value FROM config WHERE key LIKE 'volcengine%' OR key = 'tts_provider' ORDER BY key;"
"@
    Write-Host $result.Output
    
    Write-Host "`n2. 查看后端日志（最近50行）..." -ForegroundColor Yellow
    $result = Invoke-SSHCommand -SessionId $session.SessionId -Command "pm2 logs english-learning-backend --lines 50 --nostream"
    Write-Host $result.Output
    
    Write-Host "`n3. 检查后端状态..." -ForegroundColor Yellow
    $result = Invoke-SSHCommand -SessionId $session.SessionId -Command "pm2 status"
    Write-Host $result.Output
    
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
    
    Write-Host "`n完成!" -ForegroundColor Green
    
} catch {
    Write-Host "错误: $_" -ForegroundColor Red
}
