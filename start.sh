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
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

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

# 检查脚本是否存在
check_script() {
    local script_name=$1
    local script_path="$BIN_DIR/$script_name"

    if [ ! -f "$script_path" ]; then
        print_error "脚本不存在: $script_path"
        return 1
    fi

    if [ ! -x "$script_path" ]; then
        print_warning "脚本没有执行权限，正在添加..."
        chmod +x "$script_path"
        print_success "已添加执行权限"
    fi

    return 0
}

# 执行脚本
run_script() {
    local script_name=$1
    shift
    local args="$@"

    if check_script "$script_name"; then
        print_info "正在执行: $script_name $args"
        echo ""
        cd "$BIN_DIR"
        ./"$script_name" $args
        cd "$SCRIPT_DIR"
        return $?
    else
        return 1
    fi
}

# 显示主菜单
show_menu() {
    clear
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  项目管理${NC}"
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════${NC}"
    echo ""

    echo -e "${GREEN}  1.${NC} 🚀 ${BLUE}启动后端服务器${NC}     (start-server.sh)"
    echo -e "     ${PURPLE}→${NC} 启动 Node.js 后端"
    echo ""

    echo -e "${GREEN}  2.${NC} 👨‍💼 ${BLUE}启动团长端前端${NC}     (start-captain.sh)"
    echo -e "     ${PURPLE}→${NC} 启动 Vue 团长端开发环境"
    echo ""

    echo -e "${GREEN}  3.${NC} 👤 ${BLUE}启动居民端前端${NC}     (start-resident.sh)"
    echo -e "     ${PURPLE}→${NC} 启动 Vue 居民端开发环境"
    echo ""

    echo -e "${GREEN}  4.${NC} 🗄️  ${BLUE}初始化开发数据库${NC}   (server-init-dev.sh)"
    echo -e "     ${PURPLE}→${NC} 初始化 MySQL 和 MongoDB 数据库（开发环境）"
    echo ""

    echo -e "${GREEN}  5.${NC} 🗄️  ${BLUE}初始化生产数据库（腾讯云）${NC}   (server-init-prod.sh)"
    echo -e "     ${PURPLE}→${NC} 初始化腾讯云 MySQL 和 MongoDB 数据库"
    echo ""

    echo -e "${GREEN}  6.${NC} 🗄️  ${BLUE}初始化 Render 数据库${NC}   (server-init-render.sh)"
    echo -e "     ${PURPLE}→${NC} 初始化 Render 平台 MySQL 和 MongoDB 数据库"
    echo ""

    echo -e "${GREEN}  7.${NC} 🧪 ${BLUE}运行 API 测试${NC}     (test-api.sh)"
    echo -e "     ${PURPLE}→${NC} 执行服务端 API 自动化测试"
    echo ""

    echo -e "${PURPLE}═══════════════════════════════════════════════════════════${NC}"
    echo ""

    echo -e "${GREEN}  9.${NC} 🚪 ${BLUE}退出${NC}"
    echo ""

    echo -e "${PURPLE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

# 主循环
main() {
    while true; do
        show_menu

        # 重置 choice 变量，避免保留上次的输入
        choice=""

        echo -ne "${YELLOW}请选择操作 [1-7,9] (默认: 1 - 启动后端):${NC} "
        read -r choice

        # 如果用户直接按回车，默认选择 1 (启动后端)
        choice=${choice:-1}

        case $choice in
            1)
                print_header "执行: 启动后端服务器"
                run_script "start-server.sh"
                ;;

            2)
                print_header "执行: 启动团长端前端"
                run_script "start-captain.sh"
                ;;

            3)
                print_header "执行: 启动居民端前端"
                run_script "start-resident.sh"
                ;;

            4)
                print_header "执行: 初始化开发数据库"
                run_script "server-init-dev.sh"
                ;;

            5)
                print_header "执行: 初始化生产数据库（腾讯云）"
                run_script "server-init-prod.sh"
                ;;

            6)
                print_header "执行: 初始化 Render 数据库"
                run_script "server-init-render.sh"
                ;;

            7)
                print_header "执行: 运行 API 测试"
                run_script "test-api.sh"
                ;;

            9)
                print_info "感谢使用 Halavah's Tech 管理控制台"
                echo ""
                exit 0
                ;;

            *)
                print_error "无效的选项: $choice"
                ;;
        esac

        # 操作完成后，等待用户按键
        if [ "$choice" != "9" ]; then
            echo ""
            echo -e "${PURPLE}═══════════════════════════════════════════════════════════${NC}"
            echo -ne "${YELLOW}按 Enter 键返回主菜单...${NC}"
            read -r
        fi
    done
}

# 检查 bin 目录是否存在
if [ ! -d "$BIN_DIR" ]; then
    print_error "bin 目录不存在: $BIN_DIR"
    exit 1
fi

# 启动主循环（交互式菜单，直接回车默认执行选项 1）
main
