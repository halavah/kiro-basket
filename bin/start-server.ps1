
$ErrorActionPreference = "Continue"

# Navigate to script directory context
$ScriptDir = $PSScriptRoot
Set-Location "$ScriptDir/../server"

Write-Host "==================================="
Write-Host "Starting Community Group Buying Backend Server"
Write-Host "==================================="

# Check and kill process on port 3000
$Port = 3000
Write-Host "Checking port $Port..."

if (Get-Command Get-NetTCPConnection -ErrorAction SilentlyContinue) {
    try {
        $Connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        $ProcessIds = $Connections | Select-Object -ExpandProperty OwningProcess -Unique

        if ($ProcessIds) {
            foreach ($PidToKill in $ProcessIds) {
                Write-Host "Port $Port is occupied by process $PidToKill. Killing process..."
                Stop-Process -Id $PidToKill -Force -ErrorAction SilentlyContinue
            }
            Start-Sleep -Seconds 1
            Write-Host "Process killed successfully."
        } else {
            Write-Host "Port $Port is available."
        }
    } catch {
        Write-Host "Port check skipped or failed."
    }
} else {
     Write-Host "Skipping automatic port kill (Get-NetTCPConnection not found)."
}

Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "node_modules not found. Installing dependencies..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install dependencies."
        Read-Host "Press Enter to continue..."
        exit 1
    }
    Write-Host "Dependencies installed successfully."
}

# Check if .env.dev file exists
if (-not (Test-Path ".env.dev")) {
    Write-Host "Warning: .env.dev file not found!"
    Write-Host "Please create a .env.dev file with the following configuration:"
    Write-Host ""
    Write-Host "# MySQL Configuration"
    Write-Host "MYSQL_HOST=localhost"
    Write-Host "MYSQL_PORT=3306"
    Write-Host "MYSQL_USER=root"
    Write-Host "MYSQL_PASSWORD=your_password"
    Write-Host "MYSQL_DATABASE=kiro_basket"
    Write-Host ""
    Write-Host "# MongoDB Configuration"
    Write-Host "MONGO_URI=mongodb://localhost:27017/kiro_basket"
    Write-Host ""
    Write-Host "# JWT Configuration"
    Write-Host "JWT_SECRET=your_jwt_secret_key"
    Write-Host "JWT_EXPIRES_IN=7d"
    Write-Host ""
    Write-Host "# Server Configuration"
    Write-Host "PORT=3000"
    Write-Host "NODE_ENV=development"
    Write-Host ""
    Write-Host "# CORS Configuration"
    Write-Host "CORS_ORIGIN=*"
    Write-Host ""
    Write-Host "# File Upload Configuration"
    Write-Host "UPLOAD_PATH=./uploads"
    Write-Host "MAX_FILE_SIZE=2097152"
    Write-Host ""
    Read-Host "Press Enter to continue..."
    exit 1
}

# Start the server
Write-Host "Starting server..."
# Try to read NODE_ENV from file for display, though pure simple output is fine
Write-Host "API will be available at: http://localhost:$Port/api"
Write-Host "-----------------------------------"
node app-dev.js
