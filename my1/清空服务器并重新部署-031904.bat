@echo off
chcp 65001 >nul
REM ==========================================
REM 🚀 清空服务器并重新部署 (使用 deploy-20260310_031904.zip)
REM ==========================================

setlocal

set ServerHost=47.97.185.117
set ServerUser=root
set ServerPath=/root/english-learning
set LocalZipPath=my1/deploy-20260310_031904.zip

echo ========================================
echo 🚀 清空服务器并重新部署
echo ========================================
echo.

REM 检查本地zip文件是否存在
if not exist "%LocalZipPath%" (
    echo ❌ 错误: 本地部署包不存在: %LocalZipPath%
    exit /b 1
)

echo 📦 部署包: %LocalZipPath%
echo.

REM 步骤1: 在服务器上停止服务
echo 1️⃣ 停止服务器上的服务...
ssh %ServerUser%@%ServerHost% "pm2 stop all 2>/dev/null || true; pm2 delete all 2>/dev/null || true; systemctl stop nginx 2>/dev/null || true"
echo    ✅ 服务已停止
echo.

REM 步骤2: 清空服务器上的应用目录
echo 2️⃣ 清空服务器应用目录...
ssh %ServerUser%@%ServerHost% "rm -rf %ServerPath% 2>/dev/null || true; mkdir -p %ServerPath%"
echo    ✅ 目录已清空
echo.

REM 步骤3: 上传部署包
echo 3️⃣ 上传部署包到服务器...
scp "%LocalZipPath%" "%ServerUser%@%ServerHost%:%ServerPath%/"
echo    ✅ 部署包已上传
echo.

REM 步骤4: 解压部署包
echo 4️⃣ 解压部署包...
ssh %ServerUser%@%ServerHost% "cd %ServerPath% && unzip -o deploy-20260310_031904.zip -d deploy-temp && mv deploy-temp/* . && rm -rf deploy-temp deploy-20260310_031904.zip"
echo    ✅ 部署包已解压
echo.

REM 步骤5: 安装后端依赖
echo 5️⃣ 安装后端依赖...
ssh %ServerUser%@%ServerHost% "cd %ServerPath%/backend && npm install --production"
echo    ✅ 依赖安装完成
echo.

REM 步骤6: 配置Nginx
echo 6️⃣ 配置Nginx...
ssh %ServerUser%@%ServerHost% "cat > /etc/nginx/conf.d/english-learning.conf << 'NGINXEOF'
server {
    listen 80;
    server_name _;
    
    # 前端静态文件 - 使用正确的Vue应用
    location / {
        root %ServerPath%/frontend/dist;
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
NGINXEOF
nginx -t && systemctl restart nginx"
echo    ✅ Nginx配置完成
echo.

REM 步骤7: 启动后端服务
echo 7️⃣ 启动后端服务...
ssh %ServerUser%@%ServerHost% "cd %ServerPath%/backend && pm2 start src/server.js --name english-learning-backend --node-args='--max-old-space-size=512' && pm2 save"
echo    ✅ 后端服务已启动
echo.

REM 步骤8: 验证部署
echo 8️⃣ 验证部署...
ssh %ServerUser%@%ServerHost% "echo === 检查文件 === && ls -la %ServerPath%/frontend/dist/ && echo. && echo === 检查index.html内容 === && head -20 %ServerPath%/frontend/dist/index.html && echo. && echo === 检查后端服务 === && pm2 list && echo. && echo === 检查端口监听 === && netstat -tlnp | grep -E ':(80|443|3000)'"
echo.

REM 步骤9: 重启Nginx
echo 9️⃣ 重启Nginx...
ssh %ServerUser%@%ServerHost% "systemctl restart nginx && systemctl status nginx --no-pager"
echo    ✅ Nginx已重启
echo.

REM 完成
echo ========================================
echo ✅ 部署完成！
echo ========================================
echo.
echo 🌐 访问地址: http://%ServerHost%
echo 🔑 管理员账号: admin / admin123
echo.
echo 📝 下一步操作:
echo    1. 在浏览器中访问 http://%ServerHost%
echo    2. 清除浏览器缓存 (Ctrl+Shift+Delete)
echo    3. 如果页面还是显示旧内容，强制刷新 (Ctrl+F5)
echo.

endlocal
pause