# 学习模式功能 - 部署指南

## 📋 部署概述

本文档提供学习模式功能的完整部署指南,包括自动化部署脚本、手动部署步骤和验证方案。

---

## 🚀 快速部署(推荐)

### 前提条件
- 腾讯云服务器登录密码: `Admin88868`
- 项目代码已推送到Git仓库

### 部署步骤

#### 1. 登录腾讯云控制台
1. 访问: https://console.cloud.tencent.com/
2. 进入「云服务器」→「实例」
3. 点击「登录」按钮
4. 输入密码: `Admin88868`

#### 2. 执行部署命令
登录服务器后,依次执行:

```bash
# 进入项目目录
cd /root/english-learning/my1

# 拉取最新代码
git pull origin master

# 如果是新部署,先上传部署脚本
# 从本地将以下文件上传到服务器的 /root/english-learning/my1/ 目录:
#   - 服务器端部署脚本.sh
#   - verify-learning-mode.sh

# 赋予执行权限
chmod +x 服务器端部署脚本.sh
chmod +x verify-learning-mode.sh

# 执行自动化部署
./服务器端部署脚本.sh

# 等待部署完成后,执行验证脚本
./verify-learning-mode.sh
```

#### 3. 验证部署
访问网站: http://47.97.185.117

测试学习模式功能:
1. 进入学习页面
2. 切换到「小白模式」
3. 点击「标记为掌握」按钮
4. 验证英文是否正确隐藏
5. 刷新页面验证状态是否持久化

---

## 📝 手动部署步骤

如果自动化脚本失败,请按以下步骤手动部署:

### 步骤 1: 备份现有数据

```bash
cd /root/english-learning/my1

# 创建备份目录
BACKUP_DIR="/root/backup-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# 备份代码和数据库
cp -r backend frontend "$BACKUP_DIR/" 2>/dev/null || true
cp backend/database.sqlite "$BACKUP_DIR/" 2>/dev/null || true

echo "备份完成: $BACKUP_DIR"
```

### 步骤 2: 拉取最新代码

```bash
cd /root/english-learning/my1

# 拉取代码
git fetch origin
git pull origin master
```

### 步骤 3: 数据库迁移

```bash
cd /root/english-learning/my1/backend

# 检查是否需要迁移
sqlite3 database.sqlite ".schema word_mastery" | grep "unique_user_lesson_word_mastery"

# 如果没有输出,说明需要迁移
sqlite3 database.sqlite <<EOF
-- 备份现有数据
CREATE TABLE IF NOT EXISTS word_mastery_backup AS SELECT * FROM word_mastery;

-- 删除旧索引
DROP INDEX IF EXISTS unique_user_word_mastery;

-- 创建新索引(包含lessonId)
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_lesson_word_mastery
ON word_mastery (userId, lessonId, wordId);
EOF
```

### 步骤 4: 安装后端依赖

```bash
cd /root/english-learning/my1/backend

npm install --production
```

### 步骤 5: 初始化数据库

```bash
npm run db:init
```

### 步骤 6: 构建前端

```bash
cd /root/english-learning/my1/frontend

# 清理缓存(可选)
rm -rf node_modules package-lock.json dist

npm install
npm run build
```

### 步骤 7: 重启服务

```bash
cd /root/english-learning/my1

# 重启后端
pm2 restart english-backend

# 如果后端未启动,则启动新服务
pm2 start backend/src/index.js --name english-backend
pm2 save

# 重启Nginx
nginx -s reload
```

### 步骤 8: 验证服务状态

```bash
# 检查PM2状态
pm2 status

# 查看后端日志
pm2 logs english-backend --lines 20

# 检查Nginx状态
systemctl status nginx

# 测试API
curl http://localhost:3000/api/health
```

---

## ✅ 功能验证清单

### 学习模式选择器
- [ ] 显示三个学习模式选项(小白/进阶/其他)
- [ ] 模式描述文字正确
- [ ] 激活状态颜色正确(绿色/橙色/蓝色)
- [ ] 模式切换响应及时
- [ ] 刷新页面后模式状态保持

### 小白模式
- [ ] 未掌握的单词显示英文翻译
- [ ] 「标记为掌握」按钮正常显示
- [ ] 点击标记后英文立即隐藏
- [ ] 按钮状态变为"已掌握"
- [ ] 撤销标记后英文重新显示
- [ ] 刷新页面掌握状态持久化

### 进阶/其他模式
- [ ] 所有单词不显示英文
- [ ] 不显示「标记为掌握」按钮
- [ ] 拼写正确后显示完整句子

### 数据同步
- [ ] 本地localStorage正常存储
- [ ] 服务器数据库正常同步
- [ ] 不同课程的掌握状态独立

---

## 🛠 故障排查

### 问题1: 网站无法访问

```bash
# 检查Nginx状态
systemctl status nginx

# 如果未运行,启动Nginx
systemctl start nginx

# 检查Nginx配置
nginx -t

# 查看错误日志
tail -50 /var/log/nginx/error.log
```

### 问题2: 后端服务启动失败

```bash
# 查看PM2日志
pm2 logs english-backend --lines 50 --err

# 检查端口占用
netstat -tlnp | grep 3000

# 重启后端
pm2 restart english-backend
```

### 问题3: 学习模式功能不生效

```bash
# 1. 检查前端文件是否存在
ls -la /root/english-learning/my1/frontend/src/components/LearningModeSelector.vue
ls -la /root/english-learning/my1/frontend/src/stores/learning.js

# 2. 检查后端文件是否存在
ls -la /root/english-learning/my1/backend/src/models/WordMastery.js
ls -la /root/english-learning/my1/backend/src/routes/wordMastery.js

# 3. 检查数据库表结构
sqlite3 /root/english-learning/my1/backend/database.sqlite ".schema word_mastery"

# 4. 清除浏览器缓存
# 打开浏览器开发者工具 → Application → Local Storage → 清除相关数据

# 5. 查看浏览器控制台日志
# 打开浏览器开发者工具 → Console
```

### 问题4: 前端构建失败

```bash
cd /root/english-learning/my1/frontend

# 清理缓存重新构建
rm -rf node_modules package-lock.json dist
npm install
npm run build

# 查看构建错误
npm run build 2>&1 | tee build.log
```

### 问题5: 数据库迁移失败

```bash
cd /root/english-learning/my1/backend

# 查看当前表结构
sqlite3 database.sqlite ".schema word_mastery"

# 手动执行迁移
sqlite3 database.sqlite <<EOF
DROP INDEX IF EXISTS unique_user_word_mastery;
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_lesson_word_mastery
ON word_mastery (userId, lessonId, wordId);
EOF

# 验证索引
sqlite3 database.sqlite ".indexes word_mastery"
```

---

## 🔄 回滚方案

如果部署后出现严重问题,可以快速回滚:

```bash
# 1. 找到最近的备份
ls -lt /root/backup-* | head -1

# 2. 恢复备份
BACKUP_DIR=$(ls -dt /root/backup-* | head -1)
cp -r "$BACKUP_DIR/backend/"* /root/english-learning/my1/backend/
cp -r "$BACKUP_DIR/frontend/"* /root/english-learning/my1/frontend/
cp "$BACKUP_DIR/database.sqlite" /root/english-learning/my1/backend/

# 3. 重启服务
pm2 restart english-backend
nginx -s reload

# 4. 验证
./verify-learning-mode.sh
```

---

## 📊 部署文件清单

### 本地创建的文件(需上传到服务器)
1. `服务器端部署脚本.sh` - 自动化部署脚本
2. `verify-learning-mode.sh` - 验证脚本
3. `部署说明-学习模式.md` - 详细部署文档

### 修改的文件(已提交到Git)
- `frontend/src/components/LearningModeSelector.vue` - 学习模式选择器组件
- `frontend/src/views/LearningPage.vue` - 学习页面(集成模式选择器)
- `frontend/src/stores/learning.js` - 学习状态管理
- `frontend/src/services/wordMastery.js` - 单词掌握API服务
- `backend/src/models/WordMastery.js` - 数据库模型
- `backend/src/routes/wordMastery.js` - API路由
- `backend/src/services/wordMastery.js` - 业务逻辑服务
- `backend/src/index.js` - 路由注册

---

## 🔐 安全检查

### 环境变量检查
```bash
cd /root/english-learning/my1/backend

# 检查.env文件
cat .env

# 确保包含以下配置:
# JWT_SECRET=your-secret-key
# DATABASE_PATH=database.sqlite
# PORT=3000
```

### 敏感信息检查
- 不要在生产环境暴露数据库密码
- 不要提交.env文件到Git
- 定期更新JWT密钥

---

## 📈 性能优化建议

### 1. 启用PM2集群模式
```bash
cd /root/english-learning/my1

# 停止当前服务
pm2 stop english-backend
pm2 delete english-backend

# 启动集群模式(根据CPU核心数)
pm2 start backend/src/index.js --name english-backend -i max
pm2 save
```

### 2. 配置Nginx缓存
在 `/etc/nginx/conf.d/english-learning.conf` 添加:
```nginx
# 静态资源缓存
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. 启用日志轮转
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

---

## 📞 技术支持

如遇到问题,请提供以下信息:

1. **服务状态**
   ```bash
   pm2 status
   systemctl status nginx
   ```

2. **错误日志**
   ```bash
   pm2 logs english-backend --lines 50
   tail -50 /var/log/nginx/error.log
   ```

3. **数据库信息**
   ```bash
   sqlite3 /root/english-learning/my1/backend/database.sqlite ".schema word_mastery"
   ```

4. **浏览器控制台截图**
   - 打开开发者工具(F12)
   - 查看Console标签的错误信息
   - 截图保存

---

## 📅 部署记录模板

```
部署日期: ___________
部署人员: ___________
Git提交ID: ___________

部署前检查:
- [ ] 代码已推送到Git
- [ ] 数据库已备份
- [ ] 部署脚本已准备

部署结果:
- [ ] 部署成功
- [ ] 验证通过
- [ ] 功能正常

问题记录:
_______________________________________________

备注:
_______________________________________________
```

---

## ✨ 部署完成检查

部署完成后,请确认:

- [ ] 访问 http://47.97.185.117 正常
- [ ] 登录功能正常
- [ ] 进入学习页面正常
- [ ] 学习模式切换正常
- [ ] 小白模式功能正常
- [ ] 标记掌握功能正常
- [ ] 数据持久化正常
- [ ] 刷新页面状态保持
- [ ] 无控制台错误
- [ ] 后端服务状态为online

全部确认后,部署完成! 🎉
