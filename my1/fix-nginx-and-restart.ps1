#!/usr/bin/env pwsh
# ==========================================
# 🔧 修复 Nginx 配置并重启服务
# ==========================================

$ErrorActionPreference = "Stop"

$ServerHost = "47.97.185.117"
$ServerUser = "root"
$ServerPath = "/root/english-learning"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔧 修复 Nginx 配置并重启服务" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 正确的 Nginx 配置
$nginxConfig = @"
server {
    listen 80;
    server_name _;
    
    # 前端静态文件 - 使用正确的Vue应用路径
    location / {
        root $ServerPath/frontend;
        try_files \$uri \$uri/ /index.html;
        index index.html;
    }
    
    # API代理 - 保留 /api 前缀
    location /api/ {
        proxy_pass http://localhost:3000/api/;
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

# 步骤1: 上传并应用正确的 Nginx 配置
Write-Host "1️⃣ 上传正确的 Nginx 配置..." -ForegroundColor Yellow
$nginxCommands = @"
cat > /etc/nginx/conf.d/english-learning.conf << 'NGINXEOF'
$nginxConfig
NGINXEOF
nginx -t
"@
ssh $ServerUser@$ServerHost $nginxCommands
Write-Host "   ✅ Nginx 配置已更新" -ForegroundColor Green
Write-Host ""

# 步骤2: 重启 Nginx
Write-Host "2️⃣ 重启 Nginx..." -ForegroundColor Yellow
$restartNginx = @"
systemctl restart nginx
systemctl status nginx --no-pager | head -10
"@
ssh $ServerUser@$ServerHost $restartNginx
Write-Host "   ✅ Nginx 已重启" -ForegroundColor Green
Write-Host ""

# 步骤3: 重启后端服务
Write-Host "3️⃣ 重启后端服务..." -ForegroundColor Yellow
$restartBackend = @"
cd $ServerPath/backend
pm2 restart english-learning-backend
pm2 status
"@
ssh $ServerUser@$ServerHost $restartBackend
Write-Host "   ✅ 后端服务已重启" -ForegroundColor Green
Write-Host ""

# 步骤4: 验证 API 接口
Write-Host "4️⃣ 验证 API 接口..." -ForegroundColor Yellow
$verifyCommands = @"
echo "=== 测试健康检查 ==="
curl -s http://localhost:3000/health
echo ""
echo ""
echo "=== 测试验证码接口 (直接访问后端) ==="
curl -s http://localhost:3000/api/captcha
echo ""
echo ""
echo "=== 测试登录接口 (直接访问后端) ==="
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
echo ""
echo ""
echo "=== 通过 Nginx 测试验证码接口 ==="
curl -s http://localhost/api/captcha
echo ""
"@
ssh $ServerUser@$ServerHost $verifyCommands
Write-Host ""

# 完成
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ 修复完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 请在浏览器中测试:" -ForegroundColor Yellow
Write-Host "   1. 清除浏览器缓存 (Ctrl+Shift+Delete)" -ForegroundColor White
Write-Host "   2. 访问 http://47.97.185.117/categories" -ForegroundColor White
Write-Host "   3. 测试登录和注册功能" -ForegroundColor White
Write-Host ""