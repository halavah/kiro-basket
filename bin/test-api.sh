#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Navigate to the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Go to project root directory
cd "$SCRIPT_DIR/.."

# Navigate to server-test directory
cd server-test

print_header "Running API Automated Tests"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "node_modules not found. Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        print_error "Failed to install dependencies."
        exit 1
    fi
    print_success "Dependencies installed successfully."
    echo ""
fi

# Check if server is running
print_info "Checking if backend server is running..."
if ! curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo ""
    print_error "Backend server is not running on port 3000"
    print_warning "Please start the backend server first using: ./bin/start-server.sh"
    echo ""
    exit 1
fi
print_success "Backend server is running."
echo ""

# Run tests
print_info "Starting test execution..."
echo ""
npm test

# Check test result
if [ $? -ne 0 ]; then
    echo ""
    print_header "Tests completed with errors"
    echo ""
    print_info "Test reports have been generated:"
    echo "  - test-report.json  (JSON format)"
    echo "  - test-report.html  (HTML format)"
    echo ""
    print_warning "To view HTML report, run: npm run test:report"
    echo ""
    exit 1
else
    echo ""
    print_header "All tests completed successfully"
    echo ""
    print_success "Test reports have been generated:"
    echo "  - test-report.json  (JSON format)"
    echo "  - test-report.html  (HTML format)"
    echo ""

    # Ask if user wants to open HTML report
    echo -ne "${YELLOW}Would you like to open the HTML report? (Y/N):${NC} "
    read -r open
    if [[ "$open" =~ ^[Yy]$ ]]; then
        # Try to open with different commands depending on OS
        if command -v xdg-open > /dev/null; then
            xdg-open test-report.html
        elif command -v open > /dev/null; then
            open test-report.html
        else
            print_warning "Could not open HTML report automatically."
            print_info "Please open test-report.html manually."
        fi
    fi
    echo ""
    exit 0
fi
