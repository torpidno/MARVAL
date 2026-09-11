# Wireless Debugging Deploy Script for Android App
# Usage: .\deploy_wireless_adb.ps1 -IpAddress "192.168.1.50" -Port "5555" [-PairPort "37123" -PairingCode "123456"]

param (
    [Parameter(Mandatory=$true)]
    [string]$IpAddress,

    [Parameter(Mandatory=$true)]
    [string]$Port,

    [string]$PairPort,
    [string]$PairingCode
)

Write-Host "=========================================" -ForegroundColor Crimson
Write-Host "  MARVEL WATCH TRACKER - WIRELESS DEPLOY " -ForegroundColor Gold
Write-Host "=========================================" -ForegroundColor Crimson

# Check ADB executable
$adb = "$PSScriptRoot\platform-tools\adb.exe"
if (-not (Test-Path $adb)) {
    if (Test-Path "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe") {
        $adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
    } else {
        $adb = "adb"
    }
}

# Optional pairing step
if ($PairPort -and $PairingCode) {
    Write-Host "[1/3] Pairing with Wireless Debugging at ${IpAddress}:${PairPort}..." -ForegroundColor Yellow
    & $adb pair "${IpAddress}:${PairPort}" "$PairingCode"
}

# Connect step
Write-Host "[2/3] Connecting ADB to ${IpAddress}:${Port}..." -ForegroundColor Yellow
& $adb connect "${IpAddress}:${Port}"

# List devices
Write-Host "[3/3] Checking connected ADB devices..." -ForegroundColor Green
& $adb devices

# Build and Install APK
Write-Host "Building & Installing Marvel Watch Tracker APK onto Android phone..." -ForegroundColor Gold
if (Test-Path ".\gradlew.bat") {
    .\gradlew.bat installDebug
} else {
    Write-Host "Note: Open android-app in Android Studio or run gradle build to push app directly!" -ForegroundColor Cyan
}

Write-Host "Done! The app is now connected to Firebase (marval-5f1cf) on your Android phone." -ForegroundColor Green
