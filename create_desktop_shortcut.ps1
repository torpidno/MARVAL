$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath('Desktop')
$ShortcutPath = Join-Path -Path $DesktopPath -ChildPath "Marvel Watch Tracker.lnk"

$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "wscript.exe"
$Shortcut.Arguments = 'C:\Users\Zenbook\Prod\Marval\Launch Marvel App.vbs'
$Shortcut.WorkingDirectory = 'C:\Users\Zenbook\Prod\Marval'
$Shortcut.IconLocation = 'C:\Users\Zenbook\Prod\Marval\build\icon.ico'
$Shortcut.Description = 'Marvel Watch Progress Tracker'
$Shortcut.Save()

Write-Host "Desktop shortcut created successfully at: $ShortcutPath"
