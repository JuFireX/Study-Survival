# Set environment variables
$env:JAVA_HOME = "D:\Softwares\Program Files\Java\jdk-17"
$env:ANDROID_HOME = "D:\Softwares\Android\SDK"

# Add paths to System Path
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\build-tools\36.1.0;$env:Path"

# Output environment info for debugging
Write-Host "JAVA_HOME: $env:JAVA_HOME"
Write-Host "ANDROID_HOME: $env:ANDROID_HOME"

# Check Java version
java -version

# Determine project root directory
$CurrentDir = $PSScriptRoot
$CordovaAppPath = Join-Path $CurrentDir "cordova_app"

# If cordova_app is not in current dir, try looking up (in case script is in subfolder)
if (-not (Test-Path $CordovaAppPath)) {
    $UpTwoLevels = Join-Path $CurrentDir "..\.."
    if (Test-Path (Join-Path $UpTwoLevels "cordova_app")) {
        $CordovaAppPath = Join-Path $UpTwoLevels "cordova_app"
    } else {
        # Try resolving relative to script location if it's in src/docs
        $RootPath = Resolve-Path "$CurrentDir\..\.." -ErrorAction SilentlyContinue
        if ($RootPath -and (Test-Path "$RootPath\cordova_app")) {
             $CordovaAppPath = "$RootPath\cordova_app"
        }
    }
}

if (-not (Test-Path $CordovaAppPath)) {
    Write-Error "Error: Could not find 'cordova_app' directory. Please ensure the script is in the project root or src\docs directory."
    exit 1
}

# Enter cordova_app directory
Write-Host "Entering directory: $CordovaAppPath"
Set-Location -Path $CordovaAppPath

# Try to build
Write-Host "Starting build..."
cmd /c "npx cordova build android"

# Check build result
$ApkPath = Join-Path $CordovaAppPath "platforms\android\app\build\outputs\apk\debug\app-debug.apk"
$BuildSuccess = ($LASTEXITCODE -eq 0) -and (Test-Path $ApkPath)

if ($BuildSuccess) {
    Write-Host "Build SUCCESS! APK located at: $ApkPath" -ForegroundColor Green
} else {
    Write-Host "Build FAILED." -ForegroundColor Red
    if (-not (Test-Path $ApkPath)) {
        Write-Host "APK file was not found, indicating the build process failed." -ForegroundColor Yellow
    }
    
    Write-Host "`nCommon Cause: Gradle not installed or not found." -ForegroundColor Yellow
    Write-Host "Please manually install Gradle and add its 'bin' directory to your System Path."
    Write-Host "Download: https://gradle.org/releases/"
    Write-Host "Recommended Version: Gradle 8.4"
    Write-Host "See README_MOBILE.md for detailed instructions."
}
