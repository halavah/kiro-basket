
$ErrorActionPreference = "Continue"

# Navigate to script directory context
$ScriptDir = $PSScriptRoot
Set-Location "$ScriptDir/../server-test"

Write-Host "==================================="
Write-Host "Running API Automated Tests"
Write-Host "==================================="

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
    Write-Host ""
}

# Check if server is running
Write-Host "Checking if backend server is running..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -Method Head -ErrorAction SilentlyContinue
    if ($response.StatusCode -ne 200) {
        throw "Server not ready"
    }
    Write-Host "Backend server is running."
    Write-Host ""
} catch {
    Write-Host ""
    Write-Host "[WARNING] Backend server is not running on port 3000"
    Write-Host "Please start the backend server first using: start-server.ps1"
    Write-Host ""
    Read-Host "Press Enter to continue..."
    exit 1
}

# Run tests
Write-Host "Starting test execution..."
Write-Host ""
npm test
$TestExitCode = $LASTEXITCODE

# Check test result
if ($TestExitCode -ne 0) {
    Write-Host ""
    Write-Host "==================================="
    Write-Host "Tests completed with errors"
    Write-Host "==================================="
    Write-Host ""
    Write-Host "Test reports have been generated:"
    Write-Host "  - test-report.json  (JSON format)"
    Write-Host "  - test-report.html  (HTML format)"
    Write-Host ""
    Write-Host "To view HTML report, run: npm run test:report"
    Write-Host ""
    Read-Host "Press Enter to continue..."
    exit 1
} else {
    Write-Host ""
    Write-Host "==================================="
    Write-Host "All tests completed successfully"
    Write-Host "==================================="
    Write-Host ""
    Write-Host "Test reports have been generated:"
    Write-Host "  - test-report.json  (JSON format)"
    Write-Host "  - test-report.html  (HTML format)"
    Write-Host ""

    $open = Read-Host "Would you like to open the HTML report? (Y/N)"
    if ($open -eq "Y" -or $open -eq "y") {
        # 'start' is alias for Start-Process in check, but 'start' works in ps1
        Start-Process "test-report.html"
    }
    Write-Host ""
    Read-Host "Press Enter to continue..."
    exit 0
}
