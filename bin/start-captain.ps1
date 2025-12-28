
$ErrorActionPreference = "Continue"

# Navigate to script directory context
$ScriptDir = $PSScriptRoot
Set-Location "$ScriptDir/../client-captain"

Write-Host "==================================="
Write-Host "Starting Client Captain Frontend"
Write-Host "==================================="

# Check and kill process on port 5173
$Port = 5173
Write-Host "Checking port $Port..."

# Try to check port using Get-NetTCPConnection (Windows) or just skip if not available
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
        # Ignore errors during port checking
        Write-Host "Port check skipped or failed."
    }
} else {
     # Non-Windows basic check support could go here, but omitted for simplicity in PS1 script
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
Write-Host "Frontend will be available at: http://localhost:5173"
Write-Host "-----------------------------------"
npm run dev
