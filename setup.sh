#!/bin/bash

echo "================================"
echo "编程英语单词学习系统 - 项目初始化"
echo "================================"
echo ""

# 检查 Node.js 版本
echo "检查 Node.js 版本..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ 错误: 需要 Node.js 18 或更高版本"
  echo "当前版本: $(node -v)"
  exit 1
fi
echo "✅ Node.js 版本: $(node -v)"
echo ""

# 创建环境变量文件
if [ ! -f .env ]; then
  echo "创建环境变量文件..."
  cp .env.example .env
  echo "✅ .env 文件已创建"
  echo "⚠️  请编辑 .env 文件，设置必要的配置（SESSION_SECRET、ENCRYPTION_KEY）"
else
  echo "✅ .env 文件已存在"
fi
echo ""

# 安装后端依赖
echo "安装后端依赖..."
cd backend
npm install
if [ $? -eq 0 ]; then
  echo "✅ 后端依赖安装成功"
else
  echo "❌ 后端依赖安装失败"
  exit 1
fi
cd ..
echo ""

# 安装前端依赖
echo "安装前端依赖..."
cd frontend
npm install
if [ $? -eq 0 ]; then
  echo "✅ 前端依赖安装成功"
else
  echo "❌ 前端依赖安装失败"
  exit 1
fi
cd ..
echo ""

# 创建必要的目录
echo "创建必要的目录..."
mkdir -p backend/logs
mkdir -p backend/cache/audio
mkdir -p backend/uploads
echo "✅ 目录创建完成"
echo ""

echo "================================"
echo "✅ 项目初始化完成！"
echo "================================"
echo ""
echo "下一步："
echo "1. 编辑 .env 文件，设置必要的配置"
echo "2. 启动后端: cd backend && npm run dev"
echo "3. 启动前端: cd frontend && npm run dev"
echo "4. 访问应用: http://localhost:5173"
echo ""
