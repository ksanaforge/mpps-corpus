
Sub ReplaceAll(from, replaceto, regex)
    ' Selection.HomeKey Unit:=wdStory
    Selection.Find.ClearFormatting
    Selection.Find.Replacement.ClearFormatting
    Selection.Find.Replacement.Highlight = True
    With Selection.Find
        .Text = from
        .Replacement.Text = replaceto
        
        .Forward = True
        .Wrap = wdFindContinue
        .Format = True
        .MatchCase = False
        .MatchWholeWord = False
        .MatchKashida = False
        .MatchDiacritics = False
        .MatchAlefHamza = False
        .MatchControl = False
        .MatchByte = False
        .MatchAllWordForms = False
        .MatchSoundsLike = False
        .MatchFuzzy = False
        .MatchWildcards = regex
    End With
    Selection.Find.Execute Replace:=wdReplaceAll
End Sub
Sub ReplaceAllKewen(from, replaceto)
    Selection.Find.ClearFormatting
     Selection.Find.font.Bold = True
    Selection.Find.Replacement.ClearFormatting
    Selection.Find.Replacement.Highlight = True
    With Selection.Find
        .Text = from
        .Replacement.Text = "<H" + CStr(replaceto) + ">"
        
        .Forward = True
        .Wrap = wdFindContinue
        .Format = True
        .MatchCase = False
        .MatchWholeWord = False
        .MatchKashida = False
        .MatchDiacritics = False
        .MatchAlefHamza = False
        .MatchControl = False
        .MatchByte = False
        .MatchAllWordForms = False
        .MatchSoundsLike = False
        .MatchFuzzy = False
        .MatchWildcards = True
    End With
    Selection.Find.Execute Replace:=wdReplaceAll
End Sub
Sub 巨集3()
'
' 巨集3 巨集
'
'
 Call ReplaceAll("（([0-9]{1,3}[abc])）", "<大正 n=""25.\1""/>", True)
 Call ReplaceAll("^f", "<註號 n=""^&""/>", False)
 
 Selection.Find.font.Bold = True
 Call ReplaceAllKewen("[壹貳參肆伍陸柒捌玖]{1,2}、", 1)
 Call ReplaceAllKewen("（[壹貳參肆伍陸柒捌玖]{1,2}）", 2)
 Call ReplaceAllKewen("[一二三四五六七八九十]{1,2}、", 3)
 Call ReplaceAllKewen("（[一二三四五六七八九十]{1,2}）", 4)
 
 
  Call ReplaceAllKewen("[1234567890]{1,2}、", 5)
 Call ReplaceAllKewen("（[1234567890]{1,2}）", 6)
 Call ReplaceAllKewen("[ABCDEFGHIJKLMNOPQRSTUVWXYZ]、", 7)
 Call ReplaceAllKewen("（[ABCDEFGHIJKLMNOPQRSTUVWXYZ]）", 8)
 Call ReplaceAllKewen("[abcdefghijklmnopqrstuvwxz]、", 9)
 Call ReplaceAllKewen("（[abcdefghijklmnopqrstuvwxz]）", 10)


Call ReplaceAllKewen("[ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ]、", 11) 
Call ReplaceAllKewen("（[ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ]）", 12) 

End Sub


