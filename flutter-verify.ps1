$flutterBat = Join-Path $env:USERPROFILE 'flutter\bin\flutter.bat'
Write-Output "flutterBat=$flutterBat"
Write-Output "exists=$(Test-Path $flutterBat)"
if (Test-Path $flutterBat) {
    Write-Output "running version"
    $result = & $flutterBat --version 2>&1
    Write-Output $result
    Write-Output "running doctor"
    $doctor = & $flutterBat doctor --verbose 2>&1
    Write-Output $doctor
    Write-Output "running devices"
    $devices = & $flutterBat devices 2>&1
    Write-Output $devices
}
Write-Output "SystemRoot=$env:SystemRoot"
Write-Output "cmdExists=$(Test-Path (Join-Path $env:SystemRoot 'System32\cmd.exe'))"
if (Test-Path (Join-Path $env:SystemRoot 'System32\cmd.exe')) {
    & "$env:SystemRoot\System32\cmd.exe" /c "echo CMD_OK"
}
