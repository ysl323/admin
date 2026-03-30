# 创建部署包
Write-Host "========================================" -ForegroundColor Green
Write-Host "🚀 创建部署包" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# 创建临时目录
$TEMP_DIR = "deploy-package"
if (Test-Path $TEMP_DIR) {
    Remove-Item -Recurse -Force $TEMP_DIR
}
New-Item -ItemType Directory -Path $TEMP_DIR | Out-Null

Write-Host "📦 复制后端文件..." -ForegroundColor Yellow
# 复制后端文件
Copy-Item -Recurse "backend" "$TEMP_DIR/backend"

# 删除不需要的文件
Remove-Item -Recurse -Force "$TEMP_DIR/backend/node_modules" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$TEMP_DIR/backend/test*" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$TEMP_DIR/backend/check*" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$TEMP_DIR/backend/fix*" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$TEMP_DIR/backend/verify*" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$TEMP_DIR/backend/diagnose*" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$TEMP_DIR/backend/simple*" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$TEMP_DIR/backend/update*" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$TEMP_DIR/backend/clear*" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$TEMP_DIR/backend/init*" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$TEMP_DIR/backend/create*" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$TEMP_DIR/backend/delete*" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$TEMP_DIR/backend/restore*" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$TEMP_DIR/backend/sync*" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$TEMP_DIR/backend/*.json" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$TEMP_DIR/backend/*.bat" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$TEMP_DIR/backend/*.ps1" -ErrorAction SilentlyContinue

Write-Host "🌐 复制前端构建文件..." -ForegroundColor Yellow
# 复制前端构建文件
Copy-Item -Recurse "frontend/dist" "$TEMP_DIR/frontend"

Write-Host "⚙️ 创建环境配置..." -ForegroundColor Yellow
# 创建环境配置
$envContent = @"
NODE_ENV=production
PORT=3000
DB_PATH=./backend/database.sqlite
SESSION_SECRET=your-secret-key-here-$(Get-Random)
VOLCENGINE_ACCESS_KEY=your-access-key
VOLCENGINE_SECRET_KEY=your-secret-key
VOLCENGINE_REGION=cn-north-1
"@
$envContent | Out-File -FilePath "$TEMP_DIR/.env" -Encoding UTF8

Write-Host "📋 创建package.json..." -ForegroundColor Yellow
# 创建简化的package.json
$packageContent = @"
{
  "name": "english-learning-app",
  "version": "1.0.0",
  "description": "English Learning Application",
  "main": "backend/src/server.js",
  "scripts": {
    "start": "node backend/src/server.js",
    "install-deps": "cd backend && npm install --production"
  },
  "dependencies": {}
}
"@
$packageContent | Out-File -FilePath "$TEMP_DIR/package.json" -Encoding UTF8

Write-Host "📝 创建部署脚本..." -ForegroundColor Yellow
# 创建服务器部署脚本
$deployScript = @"
#!/bin/bash
echo "========================================="
echo "🚀 部署英语学习应用"
echo "========================================="

# 停止现有服务
echo "停止现有服务..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# 创建应用目录
echo "创建应用目录..."
mkdir -p /root/english-learning
cd /root/english-learning

# 安装依赖
echo "安装后端依赖..."
cd backend
npm install --production --silent

# 创建数据库
echo "初始化数据库..."
touch database.sqlite

# 启动服务
echo "启动后端服务..."
pm2 start src/server.js --name english-learning-backend --node-args='--max-old-space-size=512'

# 配置Nginx
echo "配置Nginx..."
cat > /etc/nginx/conf.d/english-learning.conf << 'EOF'
server {
    listen 80;
    server_name _;
    
    # 前端静态文件
    location / {
        root /root/english-learning/frontend;
        try_files `$uri `$uri/ /index.html;
        index index.html;
    }
    
    # API代理
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
        proxy_cache_bypass `$http_upgrade;
    }
}
EOF

# 测试并重启Nginx
nginx -t && systemctl restart nginx

echo "========================================="
echo "✅ 部署完成！"
echo "========================================="
echo "🌐 访问地址: http://服务器IP"
echo "🔑 管理员账号: admin / admin123"
echo ""
echo "📊 检查状态:"
pm2 list
echo ""
echo "🌐 端口监听:"
netstat -tlnp | grep -E ':(80|443|3000)'
"@
$deployScript | Out-File -FilePath "$TEMP_DIR/deploy.sh" -Encoding UTF8

Write-Host "📦 创建压缩包..." -ForegroundColor Yellow
# 创建压缩包
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$zipName = "deploy-$timestamp.zip"

# 使用PowerShell压缩
Compress-Archive -Path "$TEMP_DIR/*" -DestinationPath $zipName -Force

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ 部署包创建完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📦 部署包: $zipName" -ForegroundColor Cyan
Write-Host "📁 临时目录: $TEMP_DIR" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 包含内容:" -ForegroundColor Yellow
Write-Host "  - 后端代码 (backend/)" -ForegroundColor White
Write-Host "  - 前端构建文件 (frontend/)" -ForegroundColor White
Write-Host "  - 环境配置 (.env)" -ForegroundColor White
Write-Host "  - 部署脚本 (deploy.sh)" -ForegroundColor White
Write-Host "  - 包配置 (package.json)" -ForegroundColor White
Write-Host ""
Write-Host "🚀 准备上传到服务器..." -ForegroundColor Green