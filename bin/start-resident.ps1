
$ErrorActionPreference = "Continue"

# Navigate to script directory context
$ScriptDir = $PSScriptRoot
Set-Location "$ScriptDir/../client-resident"

Write-Host "==================================="
Write-Host "Starting Client Resident Frontend"
Write-Host "==================================="

# Check and kill process on port 5174
$Port = 5174
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

# Start the development server
Write-Host "Starting Vite development server..."
Write-Host "Frontend will be available at: http://localhost:5174"
Write-Host "-----------------------------------"
npm run dev
