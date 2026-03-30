# 检查部署的CSS文件

$server = "47.97.185.117"
$user = "root"
$password = ConvertTo-SecureString "Admin88868" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential($user, $password)

Write-Host "=== 检查服务器上的CSS文件 ===" -ForegroundColor Cyan

try {
    $session = New-SSHSession -ComputerName $server -Credential $credential -Force -WarningAction SilentlyContinue
    
    if ($session) {
        Write-Host "✓ 已连接到服务器" -ForegroundColor Green
        
        Write-Host "`n1. 查找LearningPage CSS文件..." -ForegroundColor Yellow
        $result = Invoke-SSHCommand -SessionId $session.SessionId -Command "ls -lh /var/www/english-learning/dist/assets/LearningPage-*.css"
        Write-Host $result.Output
        
        Write-Host "`n2. 检查underline-placeholder样式..." -ForegroundColor Yellow
        $result = Invoke-SSHCommand -SessionId $session.SessionId -Command "grep -A 10 'underline-placeholder' /var/www/english-learning/dist/assets/LearningPage-*.css"
        Write-Host $result.Output
        
        Write-Host "`n3. 检查是否有min-height..." -ForegroundColor Yellow
        $result = Invoke-SSHCommand -SessionId $session.SessionId -Command "grep 'min-height' /var/www/english-learning/dist/assets/LearningPage-*.css"
        if ($result.Output) {
            Write-Host "✓ 发现min-height" -ForegroundColor Green
            Write-Host $result.Output
        } else {
            Write-Host "❌ 没有发现min-height" -ForegroundColor Red
        }
        
        Write-Host "`n4. 检查是否有width: 100%..." -ForegroundColor Yellow
        $result = Invoke-SSHCommand -SessionId $session.SessionId -Command "grep 'width:100%' /var/www/english-learning/dist/assets/LearningPage-*.css"
        if ($result.Output) {
            Write-Host "❌ 发现错误的width: 100%" -ForegroundColor Red
            Write-Host $result.Output
        } else {
            Write-Host "✓ 没有发现width: 100%" -ForegroundColor Green
        }
        
        Remove-SSHSession -SessionId $session.SessionId | Out-Null
        Write-Host "`n✓ 已断开连接" -ForegroundColor Green
    } else {
        Write-Host "❌ 无法连接到服务器" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 错误: $_" -ForegroundColor Red
}

Write-Host "`n=== 检查完成 ===" -ForegroundColor Cyan
Write-Host "请访问: http://47.97.185.117 进行实际测试" -ForegroundColor Yellow
