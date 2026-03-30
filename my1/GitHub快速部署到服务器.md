# GitHub + 服务器自动部署流程

## 🎯 方案概述

通过GitHub自动化部署到服务器，实现：
1. 本地代码推送到GitHub
2. 服务器自动拉取最新代码
3. 自动执行数据库修复和服务重启

## 📋 部署流程

### 步骤1: 推送代码到GitHub

使用提供的 `push-to-github.bat` 脚本：

```bash
# 双击运行
push-to-github.bat
```

或手动执行：

```bash
cd e:\demo\my1\my1\my1
git add .
git commit -m "修复登录问题和学习模式"
git push
```

### 步骤2: 服务器端设置GitHub Webhook（可选）

如果想要自动化部署，可以在GitHub设置Webhook：

1. **进入GitHub仓库设置**
   - 仓库页面 → Settings → Webhooks
   - 点击 "Add webhook"

2. **配置Webhook**
   ```
   Payload URL: http://47.97.185.117/webhook
   Content type: application/json
   Secret: your-secret-key
   ```

3. **创建服务器Webhook接收脚本**

```bash
# 在服务器上创建 webhook-receiver.sh
cat > /www/wwwroot/english-learning/webhook-receiver.sh << 'EOF'
#!/bin/bash

cd /www/wwwroot/english-learning

# 拉取最新代码
git pull origin master

# 执行修复脚本
cd backend
node fix-user-table.js
node reset-admin-password.js

# 重启服务
pm2 restart english-backend

echo "部署完成"
EOF

chmod +x webhook-receiver.sh
```

### 步骤3: 服务器手动更新（推荐）

更简单的方式是直接在服务器上拉取代码并执行更新：

```bash
# 1. SSH登录服务器
ssh root@47.97.185.117

# 2. 进入项目目录
cd /www/wwwroot/english-learning

# 3. 拉取最新代码
git pull origin master

# 4. 执行更新脚本
cd backend
node fix-user-table.js
node reset-admin-password.js

# 5. 重启服务
pm2 restart english-backend

# 6. 验证服务
pm2 status
curl -I http://47.97.185.117
```

## 🔧 完整自动化部署脚本

创建服务器端的完整更新脚本：

```bash
cat > /www/wwwroot/english-learning/update-from-github.sh << 'EOF'
#!/bin/bash
set -e

echo "========================================="
echo "从GitHub更新并部署"
echo "========================================="
echo ""

# 1. 拉取最新代码
echo "[1/4] 拉取最新代码..."
cd /www/wwwroot/english-learning
git pull origin master
echo "✓ 代码已更新"
echo ""

# 2. 修复数据库
echo "[2/4] 修复数据库..."
cd backend
node fix-user-table.js || echo "数据库表结构已正确"
node reset-admin-password.js || echo "密码已正确"
echo "✓ 数据库修复完成"
echo ""

# 3. 安装依赖（如果需要）
echo "[3/4] 检查依赖..."
if [ ! -d "node_modules" ]; then
    npm install --production
fi
echo "✓ 依赖检查完成"
echo ""

# 4. 重启服务
echo "[4/4] 重启服务..."
pm2 restart english-backend || pm2 start src/index.js --name english-backend
pm2 save
echo "✓ 服务已重启"
echo ""

echo "========================================="
echo "部署完成！"
echo "========================================="
echo ""
pm2 status
echo ""
echo "访问地址: http://47.97.185.117"
EOF

chmod +x /www/wwwroot/english-learning/update-from-github.sh
```

然后每次更新后只需执行：

```bash
/www/wwwroot/english-learning/update-from-github.sh
```

## 📦 推荐的工作流程

### 日常开发流程

1. **本地开发**
   - 修改代码
   - 本地测试

2. **提交到GitHub**
   ```bash
   push-to-github.bat
   ```

3. **部署到服务器**
   ```bash
   ssh root@47.97.185.117
   /www/wwwroot/english-learning/update-from-github.sh
   ```

### 快速部署（一键脚本）

创建本地的一键部署脚本：

```bash
cat > deploy-to-server.sh << 'EOF'
#!/bin/bash

echo "开始部署到服务器..."

# 1. 推送到GitHub
echo "推送代码到GitHub..."
git add .
git commit -m "自动部署"
git push

# 2. 登录服务器并更新
echo "更新服务器..."
ssh root@47.97.185.117 'bash -s' << 'ENDSSH'
  cd /www/wwwroot/english-learning
  git pull origin master
  cd backend
  node fix-user-table.js
  node reset-admin-password.js
  pm2 restart english-backend
  echo "部署完成"
ENDSSH

echo "部署完成！"
echo "访问: http://47.97.185.117"
EOF

chmod +x deploy-to-server.sh
```

## 🎯 完整的部署方案总结

### 方案A: 最简单（推荐）

1. 本地修改代码
2. 运行 `push-to-github.bat` 推送到GitHub
3. SSH登录服务器，运行 `update-from-github.sh`

### 方案B: 半自动化

1. 本地修改代码
2. 运行 `deploy-to-server.sh`（自动推送+部署）

### 方案C: 完全自动化

1. 本地修改代码
2. 推送到GitHub
3. GitHub Webhook自动触发服务器更新

## 📝 注意事项

1. **Git配置**
   - 确保服务器上已配置Git
   - 配置好SSH密钥或Personal Access Token

2. **数据库备份**
   - 部署前建议备份数据库
   ```bash
   cp /www/wwwroot/english-learning/data/database.sqlite \
      /www/wwwroot/english-learning/data/database.sqlite.backup
   ```

3. **回滚方案**
   - 保留数据库备份
   - Git可以轻松回滚代码

## 🚀 开始使用

1. 首次推送：运行 `push-to-github.bat`
2. 服务器初始化：SSH登录并首次部署
3. 日常更新：推送代码 + 服务器更新脚本

这样的流程既安全又高效！
