Import-Module Posh-SSH

$serverIP = "47.97.185.117"
$username = "root"
$password = "Admin88868"

$securePassword = ConvertTo-SecureString $password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ($username, $securePassword)

Write-Host "Deploying new .env file..."

try {
    $session = New-SSHSession -ComputerName $serverIP -Credential $credential -AcceptKey -ErrorAction Stop
    
    # Upload .env file
    Write-Host "Uploading .env file..."
    $content = @"
# 环境配置
NODE_ENV=production
PORT=3000

# 数据库配置
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite

# Session 配置
SESSION_SECRET=your-session-secret-key-change-this-in-production

# Redis 配置（生产环境使用）
# REDIS_HOST=localhost
# REDIS_PORT=6379

# 加密密钥（用于加密 TTS API 密钥）
ENCRYPTION_KEY=default-secret-key-change-in-production-32bytes

# 日志配置
LOG_LEVEL=info

# CORS 配置
CORS_ORIGIN=*
"@
    
    # Write .env file using echo
    $cmd = "echo `"$content`" > /root/english-learning/.env"
    Invoke-SSHCommand -SessionId $session.SessionId -Command $cmd | Out-Null
    
    # Verify
    Write-Host "`nVerifying .env file..."
    $verifyCmd = "cat /root/english-learning/.env"
    $verifyResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $verifyCmd
    Write-Host $verifyResult.Output
    
    # Restart backend
    Write-Host "`nRestarting backend..."
    $restartCmd = "pm2 restart english-learning-backend"
    Invoke-SSHCommand -SessionId $session.SessionId -Command $restartCmd | Out-Null
    
    Start-Sleep -Seconds 5
    
    # Check logs
    Write-Host "`n=== Recent Logs ==="
    $logCmd = "pm2 logs english-learning-backend --lines 20 --nostream"
    $logResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $logCmd
    Write-Host $logResult.Output
    
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
    
    Write-Host "`n=== DONE ===" -ForegroundColor Green
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
