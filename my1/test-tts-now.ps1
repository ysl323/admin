# 测试当前TTS配置
$server = "47.97.185.117"
$username = "root"
$password = "Admin88868"

Write-Host "=== 测试火山引擎TTS配置 ===" -ForegroundColor Cyan

# 创建测试脚本
$testScript = @'
const axios = require('axios');

async function testTTS() {
  try {
    // 1. 登录获取cookie
    console.log('1. 登录...');
    const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    }, {
      withCredentials: true
    });
    
    const cookies = loginRes.headers['set-cookie'];
    const cookieHeader = cookies ? cookies.join('; ') : '';
    
    console.log('登录成功');
    
    // 2. 测试火山引擎TTS
    console.log('\n2. 测试火山引擎TTS...');
    const ttsRes = await axios.post('http://localhost:3000/api/admin/test-tts/volcengine', {
      text: 'Hello, this is a test.'
    }, {
      headers: {
        'Cookie': cookieHeader,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n测试结果:');
    console.log(JSON.stringify(ttsRes.data, null, 2));
    
  } catch (error) {
    console.error('\n错误:');
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

testTTS();
'@

# 上传并执行测试
Write-Host "`n上传测试脚本..." -ForegroundColor Yellow
$testScript | Out-File -FilePath "test-tts-temp.js" -Encoding UTF8

try {
    $secPassword = ConvertTo-SecureString $password -AsPlainText -Force
    $credential = New-Object System.Management.Automation.PSCredential($username, $secPassword)
    
    $session = New-SSHSession -ComputerName $server -Credential $credential -AcceptKey
    
    # 上传脚本
    Set-SCPFile -ComputerName $server -Credential $credential -LocalFile "test-tts-temp.js" -RemotePath "/root/test-tts-temp.js" -AcceptKey
    
    Write-Host "执行测试..." -ForegroundColor Yellow
    $result = Invoke-SSHCommand -SessionId $session.SessionId -Command "cd /root/english-learning/backend && node /root/test-tts-temp.js"
    
    Write-Host "`n=== 测试结果 ===" -ForegroundColor Cyan
    Write-Host $result.Output
    
    if ($result.ExitStatus -ne 0) {
        Write-Host "`n错误输出:" -ForegroundColor Red
        Write-Host $result.Error
    }
    
    # 清理
    Invoke-SSHCommand -SessionId $session.SessionId -Command "rm /root/test-tts-temp.js" | Out-Null
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
    
} catch {
    Write-Host "错误: $_" -ForegroundColor Red
} finally {
    Remove-Item "test-tts-temp.js" -ErrorAction SilentlyContinue
}

Write-Host "`n完成!" -ForegroundColor Green
