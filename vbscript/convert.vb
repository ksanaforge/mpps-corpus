
Sub ReplaceAll(from, replaceto, regex, range)
    range.Find.ClearFormatting
    range.Find.Replacement.ClearFormatting
    range.Find.Replacement.Highlight = True
    With range.Find
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
    range.Find.Execute Replace:=wdReplaceAll
End Sub

Sub RemoveBold(from, replaceto, ThisRng)

    ThisRng.Find.ClearFormatting
    ThisRng.Find.font.Bold = True
    ThisRng.Find.Replacement.ClearFormatting
    With ThisRng.Find.Replacement.font
        .Bold = False
        .Italic = False
    End With
    ThisRng.Find.Replacement.Highlight = True
    With ThisRng.Find
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
        .MatchWildcards = True
    End With
    ThisRng.Find.Execute Replace:=wdReplaceAll
End Sub
Sub RemoveItalic(from, replaceto, ThisRng)

    ThisRng.Find.ClearFormatting
    ThisRng.Find.font.Italic = True
    ThisRng.Find.Replacement.ClearFormatting
    With ThisRng.Find.Replacement.font
        .Bold = False
        .Italic = False
    End With
    ThisRng.Find.Replacement.Highlight = True
    With ThisRng.Find
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
        .MatchWildcards = True
    End With
    ThisRng.Find.Execute Replace:=wdReplaceAll
End Sub
Sub ReplaceAllKewen(from, replaceto)
    Selection.Find.ClearFormatting
     Selection.Find.font.Bold = True
    Selection.Find.Replacement.ClearFormatting

    Selection.Find.Replacement.Highlight = True
    With Selection.Find
        .Text = from
        .Replacement.Text = "<H" + CStr(replaceto) + " t=""\1"">"
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
Sub Convert()
 Set Body = ActiveDocument.StoryRanges(wdMainTextStory)
 Call ReplaceAll("（([0-9]{1,3}[abc])）", "<taisho n=""25.\1""/>", True, Body)
 Call ReplaceAll("^f", "<note n=""^&""/>", False, Body)
 
 Call ReplaceAllKewen("([壹貳參肆伍陸柒捌玖拾]{1,2})、", 1)
 Call ReplaceAllKewen("(（[壹貳參肆伍陸柒捌玖拾]{1,2}）)", 2)
 Call ReplaceAllKewen("([一二三四五六七八九十]{1,2})、", 3)
 Call ReplaceAllKewen("(（[一二三四五六七八九十]{1,2}）)", 4)
 
 
Call ReplaceAllKewen("([1234567890]{1,2})、", 5)
Call ReplaceAllKewen("(（[1234567890]{1,2}）)", 6)
Call ReplaceAllKewen("([ABCDEFGHIJKLMNOPQRSTUVWXYZ])、", 7)
Call ReplaceAllKewen("(（[ABCDEFGHIJKLMNOPQRSTUVWXYZ]）)", 8)
Call ReplaceAllKewen("([abcdefghijklmnopqrstuvwxz])、", 9)
Call ReplaceAllKewen("(（[abcdefghijklmnopqrstuvwxz]）)", 10)
Call ReplaceAllKewen("([ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ])、", 11)
Call ReplaceAllKewen("(（[ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ]）)", 12)

Call RemoveBold("", "<b>^&</b>", Body)
Call RemoveItalic("", "<i>^&</i>", Body)

Set Footnotes = ActiveDocument.StoryRanges(wdFootnotesStory)
Call RemoveBold("", "<b>^&</b>", Footnotes)

 Call ReplaceAll("^f", "<ndef n=""^&""/>", False, Footnotes)
End Sub



'===================
Function existence_of_footnotes() As Boolean
'
'tells you whether or not the footnote story range
'exists in the present document
'
'EG 3/17/2009
'https://vbaforword.wordpress.com/2009/05/10/better-search-and-replace/
'
    Dim myStoryRange As range
    For Each myStoryRange In ActiveDocument.StoryRanges
        If myStoryRange.StoryType = wdFootnotesStory Then
            existence_of_footnotes = True
            Exit For
        End If
    Next myStoryRange
End Function


