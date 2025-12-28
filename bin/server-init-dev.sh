#!/bin/bash
# 数据库初始化快捷脚本 (默认使用开发环境)

# Navigate to the directory where the script is located
cd "$(dirname "$0")"

# Go back to project root directory
cd ..

# Navigate to server-init directory
cd server-init

echo "═══════════════════════════════════════════════════"
echo "   🗄️  数据库初始化 (开发环境)"
echo "═══════════════════════════════════════════════════"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 检测到缺少依赖，正在安装..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
    echo "✅ 依赖安装成功"
    echo ""
fi

# Run init-dev.js
echo "🚀 运行开发环境初始化..."
echo ""
node init-dev.js

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ 初始化完成"
else
    echo "❌ 初始化失败"
fi

exit $EXIT_CODE
