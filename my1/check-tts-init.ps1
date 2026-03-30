# 检查 TTS 初始化状态

$serverIP = "47.97.185.117"
$username = "root"
$password = "Admin88868"

Import-Module Posh-SSH

try {
    $securePassword = ConvertTo-SecureString $password -AsPlainText -Force
    $credential = New-Object System.Management.Automation.PSCredential($username, $securePassword)

    Write-Host "连接服务器..." -ForegroundColor Yellow
    $session = New-SSHSession -ComputerName $serverIP -Credential $credential -AcceptKey
    
    # 检查脚本是否存在
    Write-Host "`n检查初始化脚本..." -ForegroundColor Yellow
    $checkScript = Invoke-SSHCommand -SessionId $session.SessionId -Command "ls -lh /root/english-learning/backend/init-tts-config.js"
    Write-Host $checkScript.Output
    
    # 检查数据库配置
    Write-Host "`n检查数据库中的 TTS 配置..." -ForegroundColor Yellow
    $sqlQuery = "SELECT key, CASE WHEN key LIKE '%api%' OR key LIKE '%secret%' THEN '***' ELSE value END as value FROM config WHERE key LIKE '%tts%' OR key LIKE '%volcengine%' OR key LIKE '%google%';"
    $checkConfig = Invoke-SSHCommand -SessionId $session.SessionId -Command "cd /root/english-learning/backend && sqlite3 database.sqlite `"$sqlQuery`""
    Write-Host $checkConfig.Output
    
    # 检查后端服务状态
    Write-Host "`n检查后端服务状态..." -ForegroundColor Yellow
    $checkPM2 = Invoke-SSHCommand -SessionId $session.SessionId -Command "pm2 list"
    Write-Host $checkPM2.Output
    
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
    
} catch {
    Write-Host "错误: $_" -ForegroundColor Red
}
