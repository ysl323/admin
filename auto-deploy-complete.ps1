# ============================================
# 编程英语学习系统 - 完全自动化部署脚本
# 无需人工干预，一键完成所有部署
# ============================================

param(
    [switch]$SkipPack = $false  # 是否跳过打包
)

# 颜色输出函数
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-ColorOutput Green "============================================"
Write-ColorOutput Green "   编程英语学习系统 - 自动化部署开始"
Write-ColorOutput Green "============================================"
Write-Host ""

# 服务器配置
$server = "47.97.185.117"
$username = "root"
$password = ConvertTo-SecureString "Admin88868" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential($username, $password)

try {
    # 步骤1: 打包项目
    if (-not $SkipPack) {
        Write-ColorOutput Cyan "[1/5] 正在打包项目..."
        if (Test-Path "deploy-package.zip") {
            Remove-Item "deploy-package.zip" -Force
        }
        
        # 使用已经创建好的部署包
        if (Test-Path "deploy-package.zip") {
            Write-ColorOutput Green "✅ 使用现有部署包"
        } else {
            Write-ColorOutput Red "❌ 部署包不存在，请先运行打包脚本"
            exit 1
        }
    } else {
        Write-ColorOutput Yellow "[1/5] 跳过打包步骤"
    }

    # 步骤2: 检查SSH模块
    Write-ColorOutput Cyan "[2/5] 检查SSH模块..."
    if (-not (Get-Module -ListAvailable -Name Posh-SSH)) {
        Write-ColorOutput Yellow "正在安装Posh-SSH模块..."
        Install-Module -Name Posh-SSH -Force -Scope CurrentUser -AllowClobber
    }
    Import-Module Posh-SSH
    Write-ColorOutput Green "✅ SSH模块就绪"

    # 步骤3: 上传文件
    Write-ColorOutput Cyan "[3/5] 正在上传文件到服务器..."
    
    # 上传部署包
    Set-SCPItem -ComputerName $server `
        -Credential $credential `
        -Path ".\deploy-package.zip" `
        -Destination "/root/" `
        -AcceptKey `
        -Force
    
    # 上传部署脚本
    Set-SCPItem -ComputerName $server `
        -Credential $credential `
        -Path ".\deploy-and-test.sh" `
        -Destination "/root/" `
        -AcceptKey `
        -Force
    
    Write-ColorOutput Green "✅ 文件上传完成"

    # 步骤4: 创建SSH会话
    Write-ColorOutput Cyan "[4/5] 连接到服务器..."
    $session = New-SSHSession -ComputerName $server `
        -Credential $credential `
        -AcceptKey `
        -Force
    Write-ColorOutput Green "✅ 已连接到服务器"

    # 步骤5: 执行部署
    Write-ColorOutput Cyan "[5/5] 正在执行部署脚本..."
    
    $deployCommands = @"
cd /root
echo "设置权限..."
chmod +x deploy-and-test.sh
echo "开始部署..."
bash deploy-and-test.sh
"@

    $result = Invoke-SSHCommand -SessionId $session.SessionId -Command $deployCommands -TimeOut 600

    # 显示部署输出
    Write-Host ""
    Write-ColorOutput Yellow "=== 部署日志 ==="
    Write-Host $result.Output
    Write-Host ""

    if ($result.ExitStatus -eq 0) {
        Write-ColorOutput Green "✅ 部署成功完成！"
    } else {
        Write-ColorOutput Red "❌ 部署过程中出现错误"
        if ($result.Error) {
            Write-Host $result.Error
        }
    }

    # 清理会话
    Remove-SSHSession -SessionId $session.SessionId

    Write-Host ""
    Write-ColorOutput Green "============================================"
    Write-ColorOutput Green "   部署完成！"
    Write-ColorOutput Green "============================================"
    Write-Host ""
    Write-ColorOutput Cyan "访问地址: http://$server"
    Write-ColorOutput Cyan "管理后台: http://$server/admin"
    Write-ColorOutput Yellow "默认账号: admin / admin123"
    Write-Host ""
    
    # 运行验证测试
    Write-ColorOutput Cyan "正在验证部署..."
    Start-Sleep -Seconds 5
    
    try {
        $healthCheck = Invoke-WebRequest -Uri "http://$server/health" -TimeoutSec 10 -UseBasicParsing
        if ($healthCheck.StatusCode -eq 200) {
            Write-ColorOutput Green "✅ 健康检查通过"
        }
    } catch {
        Write-ColorOutput Yellow "⚠ 健康检查失败，服务可能还在启动中"
    }
    
    try {
        $homepage = Invoke-WebRequest -Uri "http://$server/" -TimeoutSec 10 -UseBasicParsing
        if ($homepage.StatusCode -eq 200) {
            Write-ColorOutput Green "✅ 网站访问正常"
        }
    } catch {
        Write-ColorOutput Yellow "⚠ 网站访问失败，请检查服务状态"
    }

} catch {
    Write-ColorOutput Red "❌ 部署失败: $_"
    Write-Host $_.Exception.Message
    Write-Host $_.ScriptStackTrace
    exit 1
}
