' An example script that will launch the app in the background
'
Dim command
command = "java -cp bbb-deskshare-applet-0.9.0.jar org.bigbluebutton.deskshare.client.DeskshareMain "

'Set a reference to the arguments
Set objArgs = Wscript.Arguments

'Count the arguments
'WScript.Echo objArgs.Count

' Concatenate all command-line parameters
For Each strArg in objArgs
    command = command & Chr(32) & strArg
Next

'WScript.Echo command

Set WshShell = WScript.CreateObject("WScript.Shell")
Return = WshShell.Run(command , 0, true)

WScript.Echo Return

WScript.Quit(Return) 
