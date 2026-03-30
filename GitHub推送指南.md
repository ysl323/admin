# GitHub 推送指南

## 📋 前置条件

### 1. 安装Git
如果还没有安装Git，请先安装：
- 下载地址: https://git-scm.com/downloads
- 安装后重启命令行窗口

### 2. 创建GitHub仓库
1. 访问 https://github.com/new
2. 创建新仓库（如果还没有）
3. 获取仓库URL：`https://github.com/你的用户名/仓库名.git`

## 🚀 推送步骤

### 方法1: 首次推送（初始化仓库）

```bash
# 1. 进入项目目录
cd e:\demo\my1\my1\my1

# 2. 初始化Git仓库
git init

# 3. 添加所有文件
git add .

# 4. 创建首次提交
git commit -m "初始化项目

- 实现完整的英语学习系统
- 包含6个学习模式（小白模式、进阶模式、顺序学习、随机学习、循环学习、随机循环）
- 修复登录问题和数据库表结构
- 添加106个单词和8个课程"

# 5. 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/你的仓库名.git

# 6. 推送到GitHub
git push -u origin master
```

### 方法2: 已有仓库（更新代码）

```bash
# 1. 进入项目目录
cd e:\demo\my1\my1\my1

# 2. 查看状态
git status

# 3. 添加所有修改
git add .

# 4. 提交更改
git commit -m "修复登录问题

- 添加is_super_admin列到users表
- 重置admin密码为admin123
- 更新admin用户为超级管理员
- 完善学习模式功能"

# 5. 推送到GitHub
git push
```

### 方法3: 使用GitHub Desktop（图形界面）

1. 下载并安装 GitHub Desktop
2. 选择你的项目目录
3. 创建提交并推送

## 📝 提交信息模板

```bash
# 功能更新
git commit -m "feat: 添加新功能描述"

# 修复bug
git commit -m "fix: 修复问题描述"

# 文档更新
git commit -m "docs: 更新文档"

# 性能优化
git commit -m "perf: 性能优化描述"
```

## 🔧 常用Git命令

```bash
# 查看状态
git status

# 查看提交历史
git log

# 查看远程仓库
git remote -v

# 拉取最新代码
git pull

# 创建新分支
git branch 分支名

# 切换分支
git checkout 分支名

# 合并分支
git merge 分支名
```

## ⚠️ 注意事项

1. **忽略敏感文件**
   - `.env` 文件包含敏感信息，确保在 `.gitignore` 中
   - 数据库文件不需要提交到GitHub

2. **提交前检查**
   - 查看文件列表：`git status`
   - 确认要提交的文件

3. **分支管理**
   - 建议：开发使用 dev 分支，稳定版本在 master 分支
   - 功能开发完成后合并到 master

## 📦 项目结构

```
my1/
├── backend/              # 后端代码
│   ├── src/             # 源代码
│   │   ├── config/     # 配置
│   │   ├── models/     # 数据模型
│   │   ├── routes/     # 路由
│   │   ├── services/   # 服务
│   │   └── middleware/ # 中间件
│   ├── data/           # 数据库文件
│   └── logs/           # 日志文件
├── frontend/            # 前端代码
│   ├── src/            # 源代码
│   │   ├── components/ # 组件
│   │   ├── views/      # 页面
│   │   ├── services/   # API服务
│   │   └── stores/     # 状态管理
│   └── dist/           # 构建输出
└── *.md                 # 文档文件
```

## 🚀 自动化脚本

如果想要自动化推送流程，可以创建批处理脚本（见下文）。

## ❓ 常见问题

### Q: 提示"fatal: not a git repository"
A: 需要先执行 `git init` 初始化仓库

### Q: 推送失败提示权限错误
A: 检查GitHub仓库URL是否正确，确认有访问权限

### Q: 提示"nothing to commit"
A: 所有文件已经是最新的，没有修改需要提交

## 📞 需要帮助？

如果遇到问题，请提供：
1. 错误信息的完整截图或文本
2. 执行的命令
3. Git版本信息（`git --version`）
