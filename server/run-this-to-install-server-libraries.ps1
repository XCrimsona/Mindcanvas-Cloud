Set-ExecutionPolicy Bypass -Scope Process -Force
# Ensure package.json exists before installing
if (-not (Test-Path "package.json")) {
    Write-Host "No package.json found. Initializing..." -ForegroundColor Cyan
    npm init -y
}

# Define production dependencies with specific versions
$dependencies = @(
    "argon2@0.44.0",
    "cookie-parser@1.4.7",
    "cors@2.8.5",
    "dotenv@17.2.2",
    "express@5.2.1",
    "express-rate-limit@8.3.1",
    "ffmpeg",
    "helmet@8.1.0",
    "jsonwebtoken@9.0.2",
    "mongo-connect@0.0.6",
    "mongodb@6.19.0",
    "mongoose@8.18.1",
    "morgan@1.10.1",
    "sharp",
    "multer@2.1.1",
    "systeminformation@5.31.5"
)

# Define development dependencies
$devDependencies = @(
    "@types/express@5.0.3",
    "nodemon@3.1.10",
    "react-router-dom@7.13.1"
)

Write-Host "Installing production dependencies..." -ForegroundColor Green
npm install $dependencies

Write-Host "Installing development dependencies..." -ForegroundColor Green
npm install --save-dev $devDependencies

Write-Host "Backend dependencies installed successfully!" -ForegroundColor Cyan
