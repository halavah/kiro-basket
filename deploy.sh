#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# 打印函数
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_header() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}  $1"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BIN_DIR="$SCRIPT_DIR/bin"

# 执行脚本
run_script() {
    local script_name=$1
    if [ -f "$BIN_DIR/$script_name" ]; then
        chmod +x "$BIN_DIR/$script_name"
        print_info "正在执行: $script_name"
        cd "$BIN_DIR"
        ./"$script_name"
        cd "$SCRIPT_DIR"
    else
        echo -e "${RED}错误: 脚本 $script_name 未在 bin/ 目录下找到${NC}"
    fi
}

# 显示菜单
show_menu() {
    clear
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  Kiro Basket 部署工具${NC}"
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════${NC}"
    echo ""

    echo -e "${GREEN}  Render 平台部署${NC}"
    echo -e "${GREEN}  1.${NC} 🚀 ${BLUE}部署 Server (Render Web Service)${NC}"
    echo -e "     ${PURPLE}→${NC} 触发 Render Server 重新部署"
    echo ""

    echo -e "${GREEN}  2.${NC} 🌐 ${BLUE}部署 Captain (Render Static Site)${NC}"
    echo -e "     ${PURPLE}→${NC} 触发 Render Captain 重新部署"
    echo ""

    echo -e "${GREEN}  3.${NC} 🛒 ${BLUE}部署 Resident (Render Static Site)${NC}"
    echo -e "     ${PURPLE}→${NC} 触发 Render Resident 重新部署"
    echo ""

    echo -e "${GREEN}  4.${NC} 📦 ${BLUE}部署全栈 (Render All)${NC}"
    echo -e "     ${PURPLE}→${NC} 依次部署 Server + Captain + Resident"
    echo ""

    echo -e "${GREEN}  5.${NC} 🗄️  ${BLUE}初始化 Render 数据库${NC}"
    echo -e "     ${PURPLE}→${NC} 初始化 Render MySQL + MongoDB"
    echo ""

    echo -e "${PURPLE}═══════════════════════════════════════════════════════════${NC}"
    echo ""

    echo -e "${GREEN}  1Panel 平台部署${NC}"
    echo -e "${GREEN}  6.${NC} ⚙️  ${BLUE}部署 Server (1Panel)${NC}"
    echo -e "     ${PURPLE}→${NC} SSH 部署后端到腾讯云"
    echo ""

    echo -e "${GREEN}  7.${NC} 🌐 ${BLUE}部署 Captain (1Panel)${NC}"
    echo -e "     ${PURPLE}→${NC} SSH 部署团长端到腾讯云"
    echo ""

    echo -e "${GREEN}  8.${NC} 🛒 ${BLUE}部署 Resident (1Panel)${NC}"
    echo -e "     ${PURPLE}→${NC} SSH 部署居民端到腾讯云"
    echo ""

    echo -e "${GREEN}  9.${NC} 📦 ${BLUE}部署全栈 (1Panel All)${NC}"
    echo -e "     ${PURPLE}→${NC} 依次部署 Server + Captain + Resident + 重启"
    echo ""

    echo -e "${GREEN} 10.${NC} 🗄️  ${BLUE}初始化 1Panel 数据库${NC}"
    echo -e "     ${PURPLE}→${NC} 初始化腾讯云 MySQL + MongoDB"
    echo ""

    echo -e "${GREEN} 11.${NC} 🔄 ${BLUE}重启服务 (1Panel)${NC}"
    echo -e "     ${PURPLE}→${NC} 重启后端容器和 Nginx"
    echo ""

    echo -e "${PURPLE}═══════════════════════════════════════════════════════════${NC}"
    echo ""

    echo -e "${GREEN} 99.${NC} 🚪 ${BLUE}退出${NC}"
    echo ""
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

# 主循环
while true; do
    show_menu
    echo -ne "${YELLOW}请选择操作 [1-11, 99]: ${NC}"
    read -r choice
    case $choice in
        1)
            print_header "执行: 部署 Server (Render)"
            run_script "deploy-render-server.sh"
            ;;
        2)
            print_header "执行: 部署 Captain (Render)"
            run_script "deploy-render-captain.sh"
            ;;
        3)
            print_header "执行: 部署 Resident (Render)"
            run_script "deploy-render-resident.sh"
            ;;
        4)
            print_header "执行: 部署全栈 (Render)"
            run_script "deploy-render-full.sh"
            ;;
        5)
            print_header "执行: 初始化 Render 数据库"
            run_script "deploy-render-init-db.sh"
            ;;
        6)
            print_header "执行: 部署 Server (1Panel)"
            run_script "deploy-1panel-server.sh"
            ;;
        7)
            print_header "执行: 部署 Captain (1Panel)"
            run_script "deploy-1panel-captain.sh"
            ;;
        8)
            print_header "执行: 部署 Resident (1Panel)"
            run_script "deploy-1panel-resident.sh"
            ;;
        9)
            print_header "执行: 部署全栈 (1Panel)"
            run_script "deploy-1panel-full.sh"
            ;;
        10)
            print_header "执行: 初始化 1Panel 数据库"
            run_script "deploy-1panel-init-db.sh"
            ;;
        11)
            print_header "执行: 重启服务 (1Panel)"
            run_script "deploy-1panel-restart.sh"
            ;;
        99)
            echo "再见!"
            exit 0
            ;;
        *)
            echo -e "${RED}无效的选项${NC}"
            ;;
    esac
    echo ""
    echo -ne "${YELLOW}按 Enter 键返回主菜单...${NC}"
    read -r
done
