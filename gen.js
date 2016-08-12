/*
	input: xml generated from docx
	output: TEI
*/
"use strict";
var fs=require("fs");

var sourcepath="msword_pb_kai_kepan/xml/";
var lst=fs.readFileSync(sourcepath+"files.lst","utf8").split(/\r?\n/);
var writeToDisk=true;
//lst.length=5;

var validate=require("ksana-master-format/validatexml");
var Kepan=require("./kepan");
var Hotfix=require("./hotfix");
var Text2Tag=require("./text2tag");//known text pattern to xml tag
var allerrors=[], treecount=0;

var mode=2; //1:jin, 2 : lun
var inNdef=false;
var totalline=0;

var removeKepanStyle=function(line){
	return line.replace(/<\/?b>/g,"");
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
var processlines=function(content,juan){
	content=content.replace(/\n<\/b>/g,"</b>\n");
	content=content.replace(/<b>\n/g,"\n<b>");
	var lines=content.split("\n");
	
	inNdef=false ;
	var inBold=false;
	Kepan.newfile();
	var textlinecount=0,prevlineiskepan=false;

	for (var i=0;i<lines.length;i++) {
		if (juan==1 && line==95) debugger;
		var line=lines[i];

		if (line.indexOf("$$")>-1) {
			if (!prevlineiskepan) {
				if (inBold) { //add </b> to previous line
					lines[i-1]+="</b>";
					inBold=false;
				}
			}
			lines[i]=removeKepanStyle(line);
			prevlineiskepan=true;
			inBold=isInBold(line,inBold);
			continue; //repeated kepan ignore this line
		}

		if (line.indexOf("$")>-1) { //a kepan node
			if (!prevlineiskepan) {
				if (inBold) { //add </b> to previous line
					lines[i-1]+="</b>";
					inBold=false;
				}
			}

			if (line.indexOf("$壹、")>-1 && (mode==1 || juan<41)) { //start of a new tree
				treecount++;
				Kepan.reset(treecount,mode,juan,textlinecount,i);
			}
			Kepan.emit(line,mode,juan,textlinecount,i);
			lines[i]=removeKepanStyle(line);
			prevlineiskepan=true;
			inBold=isInBold(line,inBold);
		} else {
			if (prevlineiskepan) {
				if (inBold) {
					lines[i]="<b>"+line;
				}
			}
			prevlineiskepan=false;
			if (line.indexOf("<jin")>-1) {
				if (line.replace(/<.*?>/g,"").trim().length) { //check if text on same line
					textlinecount++;
				}
				mode=1;
				Kepan.jinAfterKepan(textlinecount);
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

	var errors=validate(content,fn,2);//output has two extra line at the top

	out=content;
	//out=`<?xml-stylesheet type="text/css" href="default.css" ?>
	//		<html><script src="script.js"></script><meta charset="UTF-8"/>
	//		<body>`+out+"</body></html>";

	out=`<link rel="stylesheet" type="text/css" href="default_html.css" />
			<html><script src="script.js"></script><meta charset="UTF-8"/>
			<body>`+out+"</body></html>";

	var newfn=fn.replace("-pb-kai-kw.docx.xml",".html");
	newfn=newfn.replace(/\d+大智度論卷/,"");
	newfn=newfn.replace(/大智度論簡介/,"");

	if (errors.length) {
		console.log(errors.length+" errors in "+fn)
		allerrors.push("==========="+fn);
		allerrors=allerrors.concat(errors);
	}
	if (writeToDisk)	fs.writeFileSync("genxml/"+newfn,out,"utf8");
}

lst.forEach(processfile);
var kepanerrors=Kepan.validate();
if (kepanerrors.length) {
	fs.writeFileSync("genxml/kepanerrors.txt",kepanerrors.join("\n"),"utf8");
} 

fs.writeFileSync("genxml/kepanview.txt",Kepan.get(),"utf8");
fs.writeFileSync("genxml/errors.txt",allerrors.join("\n"),"utf8");