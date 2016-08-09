/*
	input: xml generated from docx
	output: TEI
*/
"use strict";
var fs=require("fs");

var sourcepath="msword_pb_kai_kepan/xml/";
var lst=fs.readFileSync(sourcepath+"files.lst","utf8").split(/\r?\n/);
var writeToDisk=false;
//lst.length=5;

var validate=require("ksana-master-format/validatexml");
var Kepan=require("./kepan");
var Hotfix=require("./hotfix");
var Text2Tag=require("./text2tag");//known text pattern to xml tag
var allerrors=[], treecount=0;

var mode=2; //1:jin, 2 : lun
var inNdef=false;

var processlines=function(content,juan){
/*
	t1
	$1
   <jin>
   t2
	$2	

	$3

	$4
   <lun>

	$5


*/

	var lines=content.split("\n");
	inNdef=false;
	Kepan.newfile();
	var textlinecount=0;
	for (var i=0;i<lines.length;i++) {
//		if (i==369 && juan==35) debugger;
		var line=lines[i];
		if (line.indexOf("$$")>-1) continue; //repeated kepan ignore this line

		if (line.indexOf("$")>-1) { //a kepan node
			if (line.indexOf("$壹、")>-1) { //start of a new tree
				treecount++;
				Kepan.reset(treecount,juan,textlinecount);
			}
			Kepan.emit(line,mode,textlinecount,i);
		} else {
			if (line.indexOf("<jin/>")>-1) {
				if (line.replace(/<.*?>/g,"").trim().length) { //check if text on same line
					textlinecount++;
				}
				mode=1;
			} else if (line.indexOf("<lun/>")>-1) {
				if (line.replace(/<.*?>/g,"").trim().length) { //check if text on same line
					textlinecount++;
				}
				mode=2;
			} else if (!inNdef && line.indexOf("<ndef")>-1) {
				inNdef=true;
			} else {
				textlinecount++;
			}
		}
		
	}
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
	out=`<?xml-stylesheet type="text/css" href="default.css" ?>
			<html><script src="script.js"></script><meta charset="UTF-8"/>
			<body>`+out+"</body></html>";

	var newfn=fn.replace("-pb-kai-kw.docx.xml",".xhtml");
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