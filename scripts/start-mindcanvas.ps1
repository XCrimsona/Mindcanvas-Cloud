Set-ExecutionPolicy Bypass -Scope Process -Force
Write-Host "Launching MindCanvas Full App Pipelines..." -ForegroundColor Magenta

$pwshExe = "pwsh"

$pipelines = @(
    @{ name = "Backend"; script = "$PSScriptRoot/launchServer.ps1"; color = "Cyan" },
    @{ name = "Frontend"; script = "$PSScriptRoot/launchClient.ps1"; color = "Cyan" },
    @{ name = "Landing"; script = "$PSScriptRoot/OpenLandingPage.ps1"; color = "Yellow" }
)

foreach ($pipeline in $pipelines) {
    Write-Host "Starting $($pipeline.name) Pipeline..." -ForegroundColor $pipeline.color
    Start-Process $pwshExe -ArgumentList "-NoExit", "-File `"$($pipeline.script)`""
}

Write-Host "All pipelines launched!" -ForegroundColor Magenta
