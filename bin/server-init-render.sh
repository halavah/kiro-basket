#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}  🗄️  初始化 Render 平台数据库"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
INIT_DIR="$PROJECT_ROOT/server-init"

# 检查 server-init 目录是否存在
if [ ! -d "$INIT_DIR" ]; then
    echo -e "${RED}✗${NC} server-init 目录不存在: $INIT_DIR"
    exit 1
fi

# 进入 server-init 目录
cd "$INIT_DIR"

echo -e "${BLUE}ℹ${NC} 正在执行: node init-render.js"
echo ""

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗${NC} Node.js 未安装"
    exit 1
fi

# 检查 init-render.js 是否存在
if [ ! -f "init-render.js" ]; then
    echo -e "${RED}✗${NC} init-render.js 文件不存在"
    exit 1
fi

# 执行初始化脚本
node init-render.js

# 返回原目录
cd "$SCRIPT_DIR"
