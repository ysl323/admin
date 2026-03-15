Import-Module Posh-SSH

$serverIP = "47.97.185.117"
$username = "root"
$password = "Admin88868"

$securePassword = ConvertTo-SecureString $password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ($username, $securePassword)

Write-Host "正在连接服务器..."

try {
    $session = New-SSHSession -ComputerName $serverIP -Credential $credential -AcceptKey -ErrorAction Stop
    Write-Host "连接成功！"
    
    # 查看数据库中的TTS配置
    Write-Host "`n=== 数据库中的TTS配置 ==="
    $result = Invoke-SSHCommand -SessionId $session.SessionId -Command "sqlite3 /root/english-learning/backend/database.sqlite 'SELECT name, value FROM config WHERE name LIKE \"%tts%\" OR name LIKE \"%volc%\";'"
    Write-Host $result.Output
    
    # 断开连接
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
} catch {
    Write-Host "连接失败: $_" -ForegroundColor Red
}
