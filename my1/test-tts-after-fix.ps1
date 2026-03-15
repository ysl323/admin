# 测试修复后的 TTS 功能
Import-Module Posh-SSH

$password = ConvertTo-SecureString "Admin88868" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential("root", $password)

Write-Host "=== 测试 TTS 功能 ===" -ForegroundColor Cyan

$session = New-SSHSession -ComputerName "47.97.185.117" `
    -Credential $credential `
    -AcceptKey -Force

Write-Host "`n1. 检查数据库配置..." -ForegroundColor Yellow
$config = Invoke-SSHCommand -SessionId $session.SessionId `
    -Command 'cd /root/english-learning/backend && node -e "import(\"./src/models/index.js\").then(m => m.Config.findAll({where:{key:[\"volcengine_app_id\",\"volcengine_api_key\",\"volcengine_endpoint\",\"volcengine_cluster\",\"volcengine_voice_type\"]}})).then(r => r.forEach(c => console.log(c.key + \": \" + c.value))).then(() => process.exit(0))"'

Write-Host $config.Output

Write-Host "`n2. 测试 TTS API（使用 curl）..." -ForegroundColor Yellow
$test = Invoke-SSHCommand -SessionId $session.SessionId -TimeOut 15 `
    -Command @'
curl -s -X POST http://localhost:3000/api/tts/speak \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=test" \
  -d '{"text":"Hello"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  | head -20
'@

Write-Host $test.Output

Write-Host "`n3. 检查最新日志..." -ForegroundColor Yellow
$logs = Invoke-SSHCommand -SessionId $session.SessionId `
    -Command 'pm2 logs english-learning-backend --lines 10 --nostream'

Write-Host $logs.Output

Remove-SSHSession -SessionId $session.SessionId
Write-Host "`n完成" -ForegroundColor Green
