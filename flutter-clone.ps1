$flutterDir = Join-Path $env:USERPROFILE 'flutter'
Write-Output "flutterDir=$flutterDir"
if (Test-Path $flutterDir) {
    Write-Output 'Removing existing flutter directory'
    Remove-Item -LiteralPath $flutterDir -Recurse -Force -ErrorAction Stop
}
Write-Output 'Cloning Flutter stable from GitHub...'
git --version
git clone --depth 1 https://github.com/flutter/flutter.git -b stable $flutterDir
Write-Output 'Clone complete'
$flutterBat = Join-Path $flutterDir 'bin\flutter.bat'
Write-Output ("flutterExists=" + (Test-Path $flutterBat))
if (Test-Path $flutterBat) {
    & $flutterBat --version
} else {
    Write-Error "flutter.bat not found at $flutterBat"
}
