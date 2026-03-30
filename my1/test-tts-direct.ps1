# 直接SSH测试TTS
$server = "47.97.185.117"
$username = "root"
$password = "Admin88868"

Write-Host "=== 测试火山引擎TTS ===" -ForegroundColor Cyan

# 创建测试脚本内容
$testScript = @'
const axios = require('axios');

async function testTTS() {
  try {
    console.log('1. 登录...');
    const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    const cookies = loginRes.headers['set-cookie'];
    const cookieHeader = cookies ? cookies.join('; ') : '';
    console.log('登录成功');
    
    console.log('\n2. 测试火山引擎TTS...');
    const ttsRes = await axios.post('http://localhost:3000/api/admin/test-tts/volcengine', {
      text: 'Hello'
    }, {
      headers: {
        'Cookie': cookieHeader,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n=== 测试结果 ===');
    console.log(JSON.stringify(ttsRes.data, null, 2));
    
  } catch (error) {
    console.error('\n=== 错误 ===');
    if (error.response) {
      console.error('状态:', error.response.status);
      console.error('数据:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

testTTS();
'@

try {
    $secPassword = ConvertTo-SecureString $password -AsPlainText -Force
    $credential = New-Object System.Management.Automation.PSCredential($username, $secPassword)
    
    Write-Host "连接服务器..." -ForegroundColor Yellow
    $session = New-SSHSession -ComputerName $server -Credential $credential -AcceptKey
    
    Write-Host "创建测试脚本..." -ForegroundColor Yellow
    $createScript = @"
cat > /root/test-tts.js << 'EOFSCRIPT'
$testScript
EOFSCRIPT
"@
    
    Invoke-SSHCommand -SessionId $session.SessionId -Command $createScript | Out-Null
    
    Write-Host "执行测试..." -ForegroundColor Yellow
    $result = Invoke-SSHCommand -SessionId $session.SessionId -Command "cd /root/english-learning/backend && node /root/test-tts.js"
    
    Write-Host "`n$($result.Output)" -ForegroundColor White
    
    if ($result.Error) {
        Write-Host "`n错误: $($result.Error)" -ForegroundColor Red
    }
    
    # 清理
    Invoke-SSHCommand -SessionId $session.SessionId -Command "rm /root/test-tts.js" | Out-Null
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
    
    Write-Host "`n完成!" -ForegroundColor Green
    
} catch {
    Write-Host "错误: $_" -ForegroundColor Red
}
