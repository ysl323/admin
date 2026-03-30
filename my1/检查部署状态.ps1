# 检查服务器部署状态
param(
    [string]$ServerIP = "47.97.185.117"
)

$SERVER = "root@$ServerIP"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔍 检查服务器部署状态" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "服务器: $ServerIP" -ForegroundColor Yellow
Write-Host ""

try {
    Write-Host "正在连接服务器..." -ForegroundColor Yellow
    
    $CHECK_COMMANDS = @"
echo '========================================' && \
echo '服务器状态检查报告' && \
echo '========================================' && \
echo '' && \
echo '📅 当前时间:' && \
date && \
echo '' && \
echo '💾 磁盘使用情况:' && \
df -h /root && \
echo '' && \
echo '🔧 PM2 服务状态:' && \
pm2 list && \
echo '' && \
echo '🌐 Nginx 状态:' && \
nginx -t && \
systemctl status nginx --no-pager -l && \
echo '' && \
echo '📁 应用目录结构:' && \
if [ -d /root/english-learning ]; then \
    echo '✅ 应用目录存在' && \
    ls -la /root/english-learning/ && \
    echo '' && \
    echo '📂 后端文件:' && \
    if [ -d /root/english-learning/backend ]; then \
        echo '✅ 后端目录存在' && \
        ls -la /root/english-learning/backend/ | head -10 && \
    else \
        echo '❌ 后端目录不存在' && \
    fi && \
    echo '' && \
    echo '🎨 前端文件:' && \
    if [ -d /root/english-learning/frontend ]; then \
        echo '✅ 前端目录存在' && \
        ls -la /root/english-learning/frontend/ | head -10 && \
    else \
        echo '❌ 前端目录不存在' && \
    fi && \
    echo '' && \
    echo '🗄️ 数据库文件:' && \
    if [ -f /root/english-learning/backend/database.sqlite ]; then \
        echo '✅ 数据库文件存在' && \
        ls -lh /root/english-learning/backend/database.sqlite && \
    else \
        echo '❌ 数据库文件不存在' && \
    fi && \
    echo '' && \
    echo '⚙️ 配置文件:' && \
    if [ -f /root/english-learning/.env ]; then \
        echo '✅ 环境配置存在' && \
    else \
        echo '❌ 环境配置不存在' && \
    fi && \
    if [ -f /root/english-learning/nginx-english-learning.conf ]; then \
        echo '✅ Nginx配置存在' && \
    else \
        echo '❌ Nginx配置不存在' && \
    fi \
else \
    echo '❌ 应用目录不存在' && \
fi && \
echo '' && \
echo '📊 系统资源使用:' && \
echo '内存使用:' && \
free -h && \
echo '' && \
echo 'CPU使用:' && \
top -bn1 | grep 'Cpu(s)' && \
echo '' && \
echo '🔍 端口监听状态:' && \
netstat -tlnp | grep -E ':(80|443|3000|5173)' && \
echo '' && \
echo '📝 最近的应用日志:' && \
if [ -f /root/.pm2/logs/english-learning-backend-out.log ]; then \
    echo '最近的输出日志:' && \
    tail -5 /root/.pm2/logs/english-learning-backend-out.log && \
    echo '' && \
fi && \
if [ -f /root/.pm2/logs/english-learning-backend-error.log ]; then \
    echo '最近的错误日志:' && \
    tail -5 /root/.pm2/logs/english-learning-backend-error.log && \
    echo '' && \
fi && \
echo '🔄 数据库备份文件:' && \
ls -lt /root/database-backup-*.sqlite 2>/dev/null | head -3 || echo '无备份文件' && \
echo '' && \
echo '========================================' && \
echo '✅ 状态检查完成' && \
echo '========================================'
"@

    ssh $SERVER $CHECK_COMMANDS
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "✅ 状态检查完成" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "🌐 快速测试链接:" -ForegroundColor Cyan
        Write-Host "  主页: http://$ServerIP" -ForegroundColor White
        Write-Host "  登录: http://$ServerIP/login" -ForegroundColor White
        Write-Host "  管理: http://$ServerIP/admin" -ForegroundColor White
        Write-Host ""
        Write-Host "🔑 默认管理员账号:" -ForegroundColor Cyan
        Write-Host "  用户名: admin" -ForegroundColor White
        Write-Host "  密码: admin123" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ 状态检查失败" -ForegroundColor Red
        Write-Host ""
    }

} catch {
    Write-Host ""
    Write-Host "❌ 连接服务器失败: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "可能的原因:" -ForegroundColor Yellow
    Write-Host "1. 网络连接问题" -ForegroundColor White
    Write-Host "2. SSH密钥或密码问题" -ForegroundColor White
    Write-Host "3. 服务器不可达" -ForegroundColor White
    Write-Host ""
}

Write-Host "建议的后续操作:" -ForegroundColor Yellow
Write-Host "1. 如果服务异常，运行部署脚本" -ForegroundColor White
Write-Host "2. 检查网站是否可以正常访问" -ForegroundColor White
Write-Host "3. 测试主要功能是否正常" -ForegroundColor White
Write-Host ""