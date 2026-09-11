Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\Zenbook\Prod\Marval"
WshShell.Run "npx electron .", 0, False
