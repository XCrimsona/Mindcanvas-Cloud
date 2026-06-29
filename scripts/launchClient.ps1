Set-ExecutionPolicy Bypass -Scope Process -Force
Write-Host "Starting Frontend Client..." -ForegroundColor Cyan

# Move to root project directory to access client folder
Set-Location "$PSScriptRoot/../client"

$port = 3176

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

    $choice = Read-Host "Kill existing process? (y/n)"

    if ($choice -eq "y") {
        if ($IsWindows) {
            $process = Get-NetTCPConnection -LocalPort $port | Select-Object -First 1
            Stop-Process -Id $process.OwningProcess -Force
        } else {
            lsof -t -i :$port | xargs kill -9
        }
        Write-Host "Process on port $port killed." -ForegroundColor Red
    } else {
        Write-Host "Skipping client startup." -ForegroundColor Yellow
        return
    }
}

Write-Host "Launching Client on port http://localhost:$port..."
npm run dev
