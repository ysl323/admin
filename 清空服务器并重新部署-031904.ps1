#!/usr/bin/env pwsh
# ==========================================
# 🚀 清空服务器并重新部署 (使用 deploy-20260310_031904.zip)
# ==========================================

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 清空服务器并重新部署" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 服务器配置
$ServerHost = "47.97.185.117"
$ServerUser = "root"
$ServerPath = "/root/english-learning"
$LocalZipPath = "my1/deploy-20260310_031904.zip"

# 检查本地zip文件是否存在
if (-not (Test-Path $LocalZipPath)) {
    Write-Host "❌ 错误: 本地部署包不存在: $LocalZipPath" -ForegroundColor Red
    exit 1
}

Write-Host "📦 部署包: $LocalZipPath" -ForegroundColor Yellow
Write-Host ""

# 步骤1: 在服务器上停止服务
Write-Host "1️⃣ 停止服务器上的服务..." -ForegroundColor Yellow
$stopCommands = @"
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
systemctl stop nginx 2>/dev/null || true
"@
ssh $ServerUser@$ServerHost $stopCommands
Write-Host "   ✅ 服务已停止" -ForegroundColor Green
Write-Host ""

# 步骤2: 清空服务器上的应用目录
Write-Host "2️⃣ 清空服务器应用目录..." -ForegroundColor Yellow
$clearCommands = @"
rm -rf $ServerPath 2>/dev/null || true
mkdir -p $ServerPath
"@
ssh $ServerUser@$ServerHost $clearCommands
Write-Host "   ✅ 目录已清空" -ForegroundColor Green
Write-Host ""

# 步骤3: 上传部署包
Write-Host "3️⃣ 上传部署包到服务器..." -ForegroundColor Yellow
scp $LocalZipPath "$ServerUser@$ServerHost:$ServerPath/"
Write-Host "   ✅ 部署包已上传" -ForegroundColor Green
Write-Host ""

# 步骤4: 解压部署包
Write-Host "4️⃣ 解压部署包..." -ForegroundColor Yellow
$extractCommands = @"
cd $ServerPath
unzip -o deploy-20260310_031904.zip -d deploy-temp
mv deploy-temp/* .
rm -rf deploy-temp deploy-20260310_031904.zip
"@
ssh $ServerUser@$ServerHost $extractCommands
Write-Host "   ✅ 部署包已解压" -ForegroundColor Green
Write-Host ""

# 步骤5: 安装后端依赖
Write-Host "5️⃣ 安装后端依赖..." -ForegroundColor Yellow
$installCommands = @"
cd $ServerPath/backend
npm install --production
"@
ssh $ServerUser@$ServerHost $installCommands
Write-Host "   ✅ 依赖安装完成" -ForegroundColor Green
Write-Host ""

# 步骤6: 配置Nginx
Write-Host "6️⃣ 配置Nginx..." -ForegroundColor Yellow
$nginxConfig = @"
server {
    listen 80;
    server_name _;
    
    # 前端静态文件 - 使用正确的Vue应用
    location / {
        root $ServerPath/frontend/dist;
        try_files \$uri \$uri/ /index.html;
        index index.html;
    }
    
    # API代理
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
"@

$nginxCommands = @"
cat > /etc/nginx/conf.d/english-learning.conf << 'NGINXEOF'
$nginxConfig
NGINXEOF
nginx -t && systemctl restart nginx
"@
ssh $ServerUser@$ServerHost $nginxCommands
Write-Host "   ✅ Nginx配置完成" -ForegroundColor Green
Write-Host ""

# 步骤7: 启动后端服务
Write-Host "7️⃣ 启动后端服务..." -ForegroundColor Yellow
$startBackendCommands = @"
cd $ServerPath/backend
pm2 start src/server.js --name english-learning-backend --node-args='--max-old-space-size=512'
pm2 save
"@
ssh $ServerUser@$ServerHost $startBackendCommands
Write-Host "   ✅ 后端服务已启动" -ForegroundColor Green
Write-Host ""

# 步骤8: 验证部署
Write-Host "8️⃣ 验证部署..." -ForegroundColor Yellow
$verifyCommands = @"
echo "=== 检查文件 ==="
ls -la $ServerPath/frontend/dist/
echo ""
echo "=== 检查index.html内容 ==="
head -20 $ServerPath/frontend/dist/index.html
echo ""
echo "=== 检查后端服务 ==="
pm2 list
echo ""
echo "=== 检查端口监听 ==="
netstat -tlnp | grep -E ':(80|443|3000)'
"@
ssh $ServerUser@$ServerHost $verifyCommands
Write-Host ""

# 步骤9: 重启Nginx
Write-Host "9️⃣ 重启Nginx..." -ForegroundColor Yellow
$restartNginxCommands = @"
systemctl restart nginx
systemctl status nginx --no-pager
"@
ssh $ServerUser@$ServerHost $restartNginxCommands
Write-Host "   ✅ Nginx已重启" -ForegroundColor Green
Write-Host ""

# 完成
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ 部署完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 访问地址: http://$ServerHost" -ForegroundColor Yellow
Write-Host "🔑 管理员账号: admin / admin123" -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 下一步操作:" -ForegroundColor Yellow
Write-Host "   1. 在浏览器中访问 http://$ServerHost" -ForegroundColor White
Write-Host "   2. 清除浏览器缓存 (Ctrl+Shift+Delete)" -ForegroundColor White
Write-Host "   3. 如果页面还是显示旧内容，强制刷新 (Ctrl+F5)" -ForegroundColor White
Write-Host ""