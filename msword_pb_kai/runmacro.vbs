Set objWord = CreateObject("Word.Application")
Set args = WScript.Arguments
Set oShell = CreateObject("WScript.Shell")
Set ofso = CreateObject("Scripting.FileSystemObject")
const  wdFormatXMLDocument = 19 
const wdFormatDocumentDefault =16
const wdFormatUnicodeText = 7
rem oShell.CurrentDirectory = ofso.GetParentFolderName(Wscript.ScriptFullName) 

fn =  ofso.GetParentFolderName(Wscript.ScriptFullName)+"\"+args.Item(0)
targetfn = ofso.GetParentFolderName(Wscript.ScriptFullName)+"\xml\"+args.Item(0)+".xml"
rem create a xml subfolder manually
objWord.Visible = True
objWord.DisplayAlerts = False

objWord.Documents.Open fn ,, True
Set objDoc = objWord.ActiveDocument

objWord.Run "Normal.NewMacros.Convert"
objDoc.SaveAs  targetfn, wdFormatUnicodeText, , , , , , , , , , 65001
objDoc.Close
objWord.Quit