# 推送到 GitHub 指南

## 问题
您的 Git 配置有一个全局的 URL 重写规则,把 GitHub 重写到了 GitLab:
```ini
[url "https://jihulab.com/esp-mirror"]
    insteadOf = https://github.com
```

## 解决方案

### 方法 1: 临时禁用全局规则 (推荐)

1. 打开文件: `C:\Users\Administrator\.gitconfig`

2. 注释掉或删除这两行:
```ini
# [url "https://jihulab.com/esp-mirror"]
#     insteadOf = https://github.com
```

3. 保存文件

4. 在 PowerShell 中执行:
```powershell
cd e:\demo\my1\my1
git push -u origin master
```

5. 推送完成后,可以恢复这两行配置

### 方法 2: 使用完整 URL 推送

直接使用完整的 URL,绕过 remote 配置:

```powershell
cd e:\demo\my1\my1
git push https://github.com/ysl323/admin.git master
```

### 方法 3: 修改本地 Git 配置

编辑 `e:\demo\my1\my1\.git\config` 文件,确保内容为:

```ini
[core]
	repositoryformatversion = 0
	filemode = false
	bare = false
	logallrefupdates = true
	symlinks = false
	ignorecase = true
[remote "origin"]
	url = https://github.com/ysl323/admin.git
	fetch = +refs/heads/*:refs/remotes/origin/*
	pushurl = https://github.com/ysl323/admin.git
```

然后推送:
```powershell
cd e:\demo\my1\my1
git push -u origin master
```

## 认证说明

由于 GitHub 不再支持密码认证,您需要:

1. 创建 Personal Access Token:
   - 访问: https://github.com/settings/tokens
   - 点击 "Generate new token" -> "Generate new token (classic)"
   - 勾选 `repo` 权限
   - 生成并复制 token

2. 推送时:
   - 用户名: 您的 GitHub 用户名
   - 密码: 刚刚生成的 Personal Access Token

## 快速推送命令

选择上述任一方法后,执行:

```powershell
cd e:\demo\my1\my1
git push -u origin master
```

或者使用完整 URL:

```powershell
cd e:\demo\my1\my1
git push https://github.com/ysl323/admin.git master
```

## 验证推送成功

推送后访问: https://github.com/ysl323/admin

您应该能看到完整的代码仓库,包括:
- 后端代码 (Node.js/Express)
- 前端代码 (Vue.js)
- 导入导出功能
- 完整的项目文档
