Set-ExecutionPolicy Bypass -Scope Process -Force
Write-Host "Starting Backend Server..." -ForegroundColor Cyan

# Move to root project directory to access server folder
Set-Location "$PSScriptRoot/../server"

$port = 5176

function Test-PortInUse {
    param ([int]$Port)

    if ($IsWindows) {
        $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        return $null -ne $connection
    } else {
        $result = lsof -i :$Port 2>$null
        return -not [string]::IsNullOrEmpty($result)
    }
}

if (Test-PortInUse -Port $port) {
    Write-Host "Port $port is already in use!" -ForegroundColor Yellow

    $choice = Read-Host "Do you want to kill the process using this port? (y/n)"

    if ($choice -eq "y") {
        if ($IsWindows) {
            $process = Get-NetTCPConnection -LocalPort $port | Select-Object -First 1
            Stop-Process -Id $process.OwningProcess -Force
        } else {
            lsof -t -i :$port | xargs kill -9
        }
        Write-Host "Process on port $port killed." -ForegroundColor Red
    } else {
        Write-Host "Skipping server startup." -ForegroundColor Yellow
        return
    }
}

Write-Host "Launching Server on port http://localhost:$port..."
npm run start
