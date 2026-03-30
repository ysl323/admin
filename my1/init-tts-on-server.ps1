# 初始化服务器 TTS 配置脚本
# 上传初始化脚本到服务器并执行

$serverIP = "47.97.185.117"
$username = "root"
$password = "Admin88868"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  初始化服务器 TTS 配置" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 导入 Posh-SSH 模块
if (-not (Get-Module -ListAvailable -Name Posh-SSH)) {
    Write-Host "❌ 未安装 Posh-SSH 模块" -ForegroundColor Red
    Write-Host "请运行: Install-Module -Name Posh-SSH -Force" -ForegroundColor Yellow
    exit 1
}

Import-Module Posh-SSH

try {
    # 创建凭据
    $securePassword = ConvertTo-SecureString $password -AsPlainText -Force
    $credential = New-Object System.Management.Automation.PSCredential($username, $securePassword)

    Write-Host "📡 连接到服务器 $serverIP..." -ForegroundColor Yellow
    
    # 创建 SSH 会话
    $session = New-SSHSession -ComputerName $serverIP -Credential $credential -AcceptKey
    
    if (-not $session) {
        throw "无法建立 SSH 连接"
    }
    
    Write-Host "✅ SSH 连接成功" -ForegroundColor Green
    Write-Host ""

    # 读取本地脚本内容
    Write-Host "📤 上传初始化脚本..." -ForegroundColor Yellow
    $scriptContent = Get-Content "backend\init-tts-config.js" -Raw -Encoding UTF8
    
    # 使用 SSH 命令创建文件
    $createFileCmd = @"
cat > /root/english-learning/backend/init-tts-config.js << 'EOFSCRIPT'
$scriptContent
EOFSCRIPT
"@
    
    $uploadResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $createFileCmd
    
    if ($uploadResult.ExitStatus -eq 0) {
        Write-Host "✅ 脚本上传成功" -ForegroundColor Green
    } else {
        throw "脚本上传失败: $($uploadResult.Error)"
    }
    Write-Host ""

    # 在服务器上运行初始化脚本
    Write-Host "🚀 运行初始化脚本..." -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    
    $result = Invoke-SSHCommand -SessionId $session.SessionId -Command "cd /root/english-learning/backend && node init-tts-config.js" -TimeOut 30
    
    Write-Host $result.Output
    
    if ($result.ExitStatus -eq 0) {
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
        Write-Host "✅ TTS 配置初始化成功！" -ForegroundColor Green
        Write-Host ""
        
        # 重启后端服务
        Write-Host "🔄 重启后端服务..." -ForegroundColor Yellow
        $restartResult = Invoke-SSHCommand -SessionId $session.SessionId -Command "pm2 restart english-learning-backend"
        Write-Host $restartResult.Output
        
        if ($restartResult.ExitStatus -eq 0) {
            Write-Host "✅ 后端服务重启成功" -ForegroundColor Green
        } else {
            Write-Host "⚠️  后端服务重启失败，请手动重启" -ForegroundColor Yellow
        }
        
        Write-Host ""
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        Write-Host "  配置完成！" -ForegroundColor Cyan
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "📌 TTS 配置信息:" -ForegroundColor White
        Write-Host "   🔥 火山引擎 TTS (默认)" -ForegroundColor Yellow
        Write-Host "      - APP ID: 8594935941" -ForegroundColor Gray
        Write-Host "      - 已配置并启用" -ForegroundColor Gray
        Write-Host ""
        Write-Host "   🌐 谷歌 TTS (备用)" -ForegroundColor Yellow
        Write-Host "      - 需要在管理后台配置 API Key" -ForegroundColor Gray
        Write-Host ""
        Write-Host "📌 下一步:" -ForegroundColor White
        Write-Host "   1. 访问: http://47.97.185.117/admin" -ForegroundColor Gray
        Write-Host "   2. 登录: admin / admin123" -ForegroundColor Gray
        Write-Host "   3. 进入配置管理测试 TTS 功能" -ForegroundColor Gray
        Write-Host ""
        
    } else {
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
        Write-Host "❌ 初始化失败" -ForegroundColor Red
        Write-Host ""
        Write-Host "错误信息:" -ForegroundColor Yellow
        Write-Host $result.Error -ForegroundColor Red
    }

    # 关闭 SSH 会话
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
    
} catch {
    Write-Host ""
    Write-Host "❌ 操作失败: $_" -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "按任意键退出..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
