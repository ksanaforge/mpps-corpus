/*
	input: xml generated from docx
	output: TEI
*/
"use strict";
var fs=require("fs");

var sourcepath="msword/xml/";
var lst=fs.readFileSync(sourcepath+"files.lst","utf8").split(/\r?\n/);
var writeToDisk=true;
//lst.length=5;

//var validate=require("ksana-master-format/validatexml");
var Kepan=require("./kepan");
var Hotfix=require("./hotfix");
var Text2Tag=require("./text2tag");//known text pattern to xml tag
var treename=require("./treename");
var allerrors=[], treecount=0;

var mode=2; //1:jin, 2 : lun
var inNdef=false;
var totalline=0;

var removeKepanStyle=function(line){
	return line.replace(/<\/?b>/g,"");
}

//kai should open on close on each line
var completeKai=function(line){
	var kstart=line.lastIndexOf("<kai>");
	var kend=line.indexOf("</kai>");

	var kstart1=line.indexOf("<kai>");
	var kend1=line.lastIndexOf("</kai>");

	if (kstart==-1 && kend==-1) return line;

	if ( kstart==-1) return "<kai>"+line;
	if (kend==-1)    return line+"</kai>";
	
	if (kstart>kend1) return line+"</kai>";
	if (kend<kstart1) return "<kai>"+line;

	return line;
}
var isInBold=function(line,prevbold) {//is bold after this line
	var bold=prevbold;
	var bstart=line.lastIndexOf("<b>");
	var bend=line.lastIndexOf("</b>");

	if (bstart>-1 || bend>-1) {
		if (bend>bstart) bold=false;
		if (bstart>bend) bold=true;
	}

	return bold
}
var cleanupkepanline=function(line){
	return line.replace(/<\/b><kai><b>(.*?)<\/b><\/kai><b>/g,function(m,m1){
		return m1;
	});
}

// 針對特定的卷與行, 指定要載入 treename.js 的內容
var special_check=function(line,juan)
{
	if(juan == 3 && line.indexOf("※ 四眾皆見聖諦")>-1) return true;
	if(juan == 5 && line.indexOf("※ 釋「摩訶薩埵」")>-1) return true;
	if(juan == 11 && line.indexOf("※ 布施有何利益功德")>-1) return true;
	if(juan == 11 && line.indexOf("一、布施之體")>-1) return true;
	if(juan == 11 && line.indexOf("一、何謂「法施」")>-1) return true;
	if(juan == 13 && line.indexOf("貳、尸羅波羅蜜（之二）")>-1) return true;
	if(juan == 13 && line.indexOf("※ 因論生論：云何戒為八正道初門")>-1) return true;
	//if(juan == 14 && line.indexOf("九、釋「尸羅波羅蜜」")>-1) return true;
	if(juan == 15 && line.indexOf("貳、忍波羅蜜（之二）")>-1) return true;
	if(juan == 16 && line.indexOf("貳、精進波羅蜜（之二）")>-1) return true;
	if(juan == 18 && line.indexOf("貳、般若波羅蜜（之二）")>-1) return true;
	if(juan == 20 && line.indexOf("貳、空三昧等八種定法")>-1) return true;
	if(juan == 20 && line.indexOf("三、四無量心")>-1) return true;
	if(juan == 21 && line.indexOf("五、八背捨")>-1) return true;
	if(juan == 21 && line.indexOf("參、九相（九想）")>-1) return true;
	if(juan == 21 && line.indexOf("肆、八念")>-1) return true;
	if(juan == 23 && line.indexOf("伍、十想")>-1) return true;
	if(juan == 23 && line.indexOf("陸、十一智")>-1) return true;
	if(juan == 25 && line.indexOf("參、依聲聞法釋「四無所畏」")>-1) return true;

	return false;
}

var processlines=function(content,juan){
	content=content.replace(/\n<\/b>/g,"</b>\n");
	content=content.replace(/<b>\n/g,"\n<b>");
	var lines=content.split("\n");
	
	inNdef=false ;
	var inBold=false;
	Kepan.newfile();
	var textlinecount=0,prevlineiskepan=false;

	for (var i=0;i<lines.length;i++) {
		if (juan==11 && i==336) debugger;
		var line=lines[i];
		if (line.indexOf("$")>-1 && line.indexOf("<kai>")>-1) {
			line=cleanupkepanline(line);
		}

		if (line.indexOf("$$")>-1) {
			if (!prevlineiskepan) {
				if (inBold) { //add </b> to previous line
					lines[i-1]+="</b>";
					inBold=false;
				}
			}
			inBold=isInBold(line,inBold);
			line=removeKepanStyle(line);
			lines[i]=line;
			prevlineiskepan=true;
			continue; //repeated kepan ignore this line
		}

		if (line.indexOf("$")>-1) { //a kepan node
			if (!prevlineiskepan) {
				if (inBold) { //add </b> to previous line
					lines[i-1]+="</b>";
					inBold=false;
				}
			}
			//juan 1~40, 42 , top level kepan might come before <jin>
			//※ same as 壹, but without  貳, used in ※禪波羅密 juan 17
			if ((line.indexOf("壹、")>-1||line.indexOf("※、")>-1||special_check(line,juan))
			 &&line.indexOf("拾壹、")===-1 
			&& (mode==1 || juan<41 || juan==42 )) { //start of a new tree

				var text=treename[treecount];
				Kepan.reset(text,mode,juan,textlinecount,i);
				treecount++;
			}
			Kepan.emit(line,mode,juan,textlinecount,i);
			lines[i]=removeKepanStyle(line);
			prevlineiskepan=true;
			inBold=isInBold(line,inBold);
		} else {
			if (prevlineiskepan) {
				if (inBold) {
					line="<b>"+line;
					lines[i]=line;
				}
			}
			prevlineiskepan=false;
			if (line.indexOf("<jin")>-1) {
				Kepan.jinAfterKepan(textlinecount);

				if (line.replace(/<.*?>/g,"").trim().length) { //check if text on same line
					textlinecount++;
				}
				mode=1;

			} else if (line.indexOf("<lun")>-1) {
				if (line.replace(/<.*?>/g,"").trim().length) { //check if text on same line
					textlinecount++;
				}
				mode=2;
			} else if (!inNdef && line.indexOf("<ndef")>-1) {
				inNdef=true;
			} else {
				textlinecount++;
			}
			inBold=isInBold(line,inBold);
			//line=completeKai(line);
			if (line!==lines[i]) {
				lines[i]=line;
			}
		}

	}
	lines=Kepan.patchKepan(lines,juan);
	totalline+=lines.length;
	return lines.join("\n");
}
var processfile=function(fn){
	var out="";
	var content=fs.readFileSync(sourcepath+fn,'utf8');
	var juan=parseInt(fn);
	content=content.replace(/\r?\n/g,"\n");
	content=Hotfix.removeNopTagBefore(content)

	content=Text2Tag.doAll(content);

	content=processlines(content,juan);

	content=Hotfix.removeNopTagAfter(content);

	//var errors=validate(content,fn,2);//output has two extra line at the top

	out=content;
	//out=`<?xml-stylesheet type="text/css" href="default.css" ?>
	//		<html><script src="script.js"></script><meta charset="UTF-8"/>
	//		<body>`+out+"</body></html>";

	out=`<link rel="stylesheet" type="text/css" href="default_html.css" />
			<html><script src="script.js"></script><meta charset="UTF-8"/>
			<body>`+out+"</body></html>";

	var newfn=fn.replace("-pb-kai-kw-01.docx.xml",".html");
	newfn=newfn.replace(/\d+大智度論卷/,"");
	newfn=newfn.replace(/大智度論簡介/,"");

/*
	if (errors.length) {
		console.log(errors.length+" errors in "+fn)
		allerrors.push("==========="+fn);
		allerrors=allerrors.concat(errors);
	}
*/	
	if (writeToDisk)	fs.writeFileSync("genxml/"+newfn,out,"utf8");
}

lst.forEach(processfile);
var kepanerrors=Kepan.validate();
if (kepanerrors.length) {
	fs.writeFileSync("genxml/kepanerrors.txt",kepanerrors.join("\n"),"utf8");
} 

fs.writeFileSync("genxml/kepanview.txt",Kepan.get(),"utf8");
fs.writeFileSync("genxml/errors.txt",allerrors.join("\n"),"utf8");