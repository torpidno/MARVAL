param(
    [string]$Device = "192.168.68.100:36141",
    [int]$SyncTimeoutSec = 600,
    [int]$BuildTimeoutSec = 1800,
    [int]$InstallTimeoutSec = 300
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$adb = Join-Path $root "android-sdk\platform-tools\adb.exe"
$apk = Join-Path $root "android\app\build\outputs\apk\debug\app-debug.apk"
$env:JAVA_HOME = Join-Path $root "jdk21"

function Invoke-WithTimeout {
    param(
        [string]$Name,
        [scriptblock]$Block,
        [int]$TimeoutSec
    )
    $job = Start-Job -ScriptBlock $Block
    if (Wait-Job -Job $job -Timeout $TimeoutSec) {
        Receive-Job -Job $job | Out-Host
        if ($job.State -ne "Completed") { throw "$Name failed (exit state: $($job.State))" }
        Remove-Job -Job $job -Force
    } else {
        Stop-Job -Job $job -Force | Out-Null
        Remove-Job -Job $job -Force
        throw "$Name timed out after $TimeoutSec seconds"
    }
}

Invoke-WithTimeout -Name "web build + capacitor sync" -TimeoutSec $SyncTimeoutSec -Block {
    Set-Location $using:root
    npm run android:sync 2>&1 | Out-String | Write-Output
    if ($LASTEXITCODE -ne 0) { throw "android:sync failed" }
}

Invoke-WithTimeout -Name "gradle assembleDebug" -TimeoutSec $BuildTimeoutSec -Block {
    Set-Location (Join-Path $using:root "android")
    $env:JAVA_HOME = Join-Path $using:root "jdk21"
    & .\gradlew.bat assembleDebug 2>&1 | Out-String | Write-Output
    if ($LASTEXITCODE -ne 0) { throw "gradle build failed" }
}

if (-not (Test-Path -LiteralPath $apk)) { throw "APK not found: $apk" }

Invoke-WithTimeout -Name "adb install" -TimeoutSec $InstallTimeoutSec -Block {
    $adb = $using:adb
    $apk = $using:apk
    $device = $using:Device
    & $adb connect $device 2>&1 | Out-String | Write-Output
    & $adb -s $device install -r $apk 2>&1 | Out-String | Write-Output
    if ($LASTEXITCODE -ne 0) { throw "adb install failed" }
}

Write-Output "Android app updated and installed on $Device"
