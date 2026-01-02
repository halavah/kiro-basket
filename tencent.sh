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
    echo -e "${CYAN}  腾讯云部署工具${NC}"
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════${NC}"
    echo ""

    echo -e "${GREEN}  1.${NC} 🌐 ${BLUE}部署团长端前端 (Captain)${NC}"
    echo -e "     ${PURPLE}→${NC} 构建并部署团长端 Vue 应用"
    echo ""

    echo -e "${GREEN}  2.${NC} 🛒 ${BLUE}部署居民端前端 (Resident)${NC}"
    echo -e "     ${PURPLE}→${NC} 构建并部署居民端 Vue 应用"
    echo ""

    echo -e "${GREEN}  3.${NC} ⚙️  ${BLUE}部署后端服务 (Server)${NC}"
    echo -e "     ${PURPLE}→${NC} 打包并部署 Node.js 后端"
    echo ""

    echo -e "${PURPLE}═══════════════════════════════════════════════════════════${NC}"
    echo ""

    echo -e "${GREEN}  4.${NC} 🚀 ${BLUE}部署全栈 (All)${NC}"
    echo -e "     ${PURPLE}→${NC} 依次部署后端 + 团长端 + 居民端"
    echo ""

    echo -e "${PURPLE}═══════════════════════════════════════════════════════════${NC}"
    echo ""

    echo -e "${GREEN}  5.${NC} 🔄 ${BLUE}重启服务${NC}"
    echo -e "     ${PURPLE}→${NC} 重启后端容器和 Nginx"
    echo ""

    echo -e "${GREEN}  6.${NC} 🗄️  ${BLUE}初始化腾讯云数据库${NC}"
    echo -e "     ${PURPLE}→${NC} 初始化腾讯云 MySQL 和 MongoDB"
    echo ""

    echo -e "${PURPLE}═══════════════════════════════════════════════════════════${NC}"
    echo ""

    echo -e "${GREEN}  9.${NC} 🚪 ${BLUE}退出${NC}"
    echo ""
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

# 重启服务
restart_services() {
    run_script "tencent-restart.sh"
}

# 主循环
while true; do
    show_menu
    echo -ne "${YELLOW}请选择操作 [1-6, 9]: ${NC}"
    read -r choice
    case $choice in
        1)
            print_header "执行: 部署团长端前端"
            run_script "tencent-deploy-client-captain.sh"
            restart_services
            ;;
        2)
            print_header "执行: 部署居民端前端"
            run_script "tencent-deploy-client-resident.sh"
            restart_services
            ;;
        3)
            print_header "执行: 部署后端服务"
            run_script "tencent-deploy-server.sh"
            restart_services
            ;;
        4)
            print_header "执行: 部署全栈 (后端 + 团长端 + 居民端)"
            run_script "tencent-deploy-server.sh"
            echo ""
            echo -e "${YELLOW}等待 3 秒后继续部署团长端...${NC}"
            sleep 3
            run_script "tencent-deploy-client-captain.sh"
            echo ""
            echo -e "${YELLOW}等待 3 秒后继续部署居民端...${NC}"
            sleep 3
            run_script "tencent-deploy-client-resident.sh"
            restart_services
            ;;
        5)
            print_header "执行: 重启服务"
            restart_services
            ;;
        6)
            print_header "执行: 初始化腾讯云数据库"
            run_script "tencent-init-db.sh"
            ;;
        9)
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
