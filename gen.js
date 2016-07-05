/*
	input: xml generated from docx
	output: TEI
*/
"use strict";
var fs=require("fs");
var sourcepath="msword_pb_kai_kepan/xml/";
var lst=fs.readFileSync(sourcepath+"files.lst","utf8").split(/\r?\n/);
var validate=require("ksana-master-format/validatexml");
var allerrors=[];
var toc=[];
var writeToDisk=true;
//lst.length=16;

var replacePb=function(content){
	return content.replace(/`(\d+)`/g,function(m,m1){
		return '<pb n="'+m1+'"/>';
	});
}

var hotfixes={
	2:[
	['<kai><jin>經</jin><b>婆伽婆</kai></b>','<jin>經</jin><kai>婆伽婆</kai>']
	],
	21:[
	['$（2）<h3 t="三、">四勝處</h3>','<h6 t="（2）">三、四勝處</h6>']
	]
}



var fix_head=function(content){
	/*
	return content.replace(/<b><h(.*?)<\/b>/g,function(m,m1){
		return "<h"+m1;
	}).replace(/<b><pb(.*?)><h(.*?)<\/b>/g,function(m,pb,m1){
		return "<pb"+pb+"><h"+m1;
	})
*/

	return content.replace(/\n<\/h(\d+)>/g,function(m,m1){
		return '</h'+m1+">\n"; //move endtag at begining of line to previous end of line
	});

	//TODO, remove <b></b> in head group
	//<b><h4 t="（三）">辨異同</h4>
  //<h5 t="1">法王與輪王同異</h5></b>
}
var dohotfix=function(content,fn) {
	var prefix=parseInt(fn);
	var hotfix=hotfixes[prefix];
	if (!hotfix)return content;

	for (var i=0;i<hotfix.length;i++) {
		content=content.replace(hotfix[i][0],hotfix[i][1]);
	}
	return content;
}

var ReplaceAllKewen=function(lines,pat,depth) {//first pass, endtag not found yet
	var reg=new RegExp(pat,"");
	var i,line;
	var bold=false,lastidx=0,prevdepth=0;

	for (i=0;i<lines.length;i++) {
		line=lines[i];
		if (line.indexOf("<ndef")>-1) break; //no kepan after first ndef

		if (line.indexOf("$")==-1) continue;
		if (line.indexOf("<h")>-1) continue; //already parse


		line=mark_mpps_yinshun_note(line);
		line=mark_see_previous_juan(line);
		
		line=line.replace(/<b>(.*?)<\/b>/,function(m,m1){return m1});
		//line=line.replace("$","");
		var match=false;
		line=line.replace(reg , function(m,m1,idx){
			prevdepth=depth;
			match=true;
			return "<h"+depth+' t="'+m1+'">';	
		});

		if (match) line=line+"</h"+prevdepth+">";

		lines[i]=line;
	}
	return lines;
}
var processExtraKepan=function(lines) { //因論生論
	var depth=0;
	for (var i=0;i<lines.length;i++) {
		var line=lines[i];
		var h=line.indexOf("<h");
		if (h>0) {
			var m=line.match(/<h(\d+)/);
			depth=parseInt(m[1]);

			if (line.indexOf("$$")>-1) {
				line=line.replace("$$","");
				line=line.replace(/<h(\d+) (.+?)>/,function(m,d,m1){return "<h"+d+' repeat="1" '+m1+">"});
			}
		} else if (line.indexOf("$")>-1) {
			line=line.replace(/\$([^<]+)(.*)/,function(m,m1,m2){
				return "<h"+(depth+1)+">"+m1+"</h"+(depth+1)+">"+m2;
			});		
		}
		if (line!==lines[i])			lines[i]=line;

	}
	return lines;
}
var removeKepanTag=function(lines,tag){
	var groupstart=0, inkepan=false, bopen=0,bclose=0;
	var openpat=new RegExp("<"+tag+">","g"), closepat=new RegExp("</"+tag+">","g");
	var  bothpat=new RegExp("</?"+tag+">","g");
	for (var i=0;i<lines.length;i++) {
		var line=lines[i];
		if (line.indexOf("<h")==-1) {
			inkepan=false;
			if (bopen&&bclose&&bopen==bclose) { //save to remove all
				for (var j=groupstart;j<i;j++) {
					lines[j]=lines[j].replace(bothpat,"");
				}
			} else if (bclose+1==bopen){ //not closing, bold text after kepan
				for (var j=groupstart;j<i;j++) {
					lines[j]=lines[j].replace(bothpat,"");
				}
				lines[i]="<"+tag+">"+lines[i];
			} else if (bclose==bopen+1) { //<b> before group start
				for (var j=groupstart;j<i;j++) {
					lines[j]=lines[j].replace(bothpat,"");
				}
				lines[groupstart-1]=lines[groupstart-1]+"</"+tag+">";

			} else if (bclose || bopen) {
				for (var j=groupstart;j<i;j++) {
					console.log(lines[j]);
				}
				console.log("cannot process",bopen,bclose,groupstart,i);
			}
			bopen=0;bclose=0;
		} else {
			if (!inkepan) {
				groupstart=i;
			}
			line.replace(openpat,function(){bopen++});
			line.replace(closepat,function(){bclose++});
			inkepan=true;
		}
	}
	return lines;
}
var processKepan=function(content) {//move from vbscript
	content=content.replace(/\n<\/b>/g,"</b>\n");

	var lines=	content.split("\n");

	lines=ReplaceAllKewen(lines,"(（[ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ]）)", 12);
	lines=ReplaceAllKewen(lines,"([ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ]、)", 11);
	lines=ReplaceAllKewen(lines,"(（[abcdefghijklmnopqrstuvwxz]）)", 10);
	lines=ReplaceAllKewen(lines,"([abcdefghijklmnopqrstuvwxz]、)", 9);
	lines=ReplaceAllKewen(lines,"(（[ABCDEFGHIJKLMNOPQRSTUVWXYZ]）)", 8);
	lines=ReplaceAllKewen(lines,"([ABCDEFGHIJKLMNOPQRSTUVWXYZ]、)", 7);
	lines=ReplaceAllKewen(lines,"(（[0-9～\-]{1,5}）)", 6);
	lines=ReplaceAllKewen(lines,"([0-9～\-]{1,5}、)", 5);
	lines=ReplaceAllKewen(lines,"(（[一二三四五六七八九十～\-]+）)", 4);
	lines=ReplaceAllKewen(lines,"([一二三四五六七八九十～\-]+、)", 3);
	lines=ReplaceAllKewen(lines,"(（[壹貳参參肆伍陸柒捌玖拾～]+）)", 2);
	lines=ReplaceAllKewen(lines,"([壹貳参參肆伍陸柒捌玖拾～]+、)", 1);

	lines=processExtraKepan(lines);//因論生論
	lines=removeKepanTag(lines,"b");
	lines=removeKepanTag(lines,"kai");

	//move <note outof kepan


	content= lines.join("\n");
	content=content.replace(/<note(.+?)<\/h(\d+)>/g,function(m,tag,d){
		return "</h"+d+"><note"+tag;
	});
	return content;
}


/*
	if no <b> at begining of the group, might not be a kepan 
	parse 印順法師，《大智度論筆記》
  check 承上卷
  remove all <b> and </b> in kepan group
  if <b> is not close, output <b> when kepan group is ended.

  remove kai , as known by luan
*/
var matchcount=function(line,pat){
	var m=0;
	line.replace(pat, function(){m++});
	return m;
}

var mark_mpps_yinshun_note=function(line){
	line=line.replace(/（?印順法師，《?大智度論筆記》[〔［](.+?)[〕］]p\.(\d+)；[〔［](.+?)[〕］]p\.(\d+)/,function(m,bk1,pg1,bk2,pg2){
		return '<note_mpps ref="'+bk1+'#'+pg1+'"/><note_mpps ref="'+bk2+'#'+pg2+'"/>';
	});

	return line.replace(/（?印順法師，《?大智度論筆記》[〔［](.+?)[〕］]p\.(\d+)）/,function(m,bk,pg){
		return '<note_mpps ref="'+bk+'#'+pg+'"/>';
	});
}

var mark_taisho=function(line) {
	return line.replace(/（大正(\d+)，(.+?)，n\.(.+?)）/g,function(m,vol,pg,sutra){
		return '<note_taisho vol="'+vol+'" pg="'+pg+'" n="'+sutra+'"/>';
	}).replace(/（大正(\d+)，(.+?)）/g,function(m,vol,pg){
		return '<note_taisho vol="'+vol+'" pg="'+pg+'"/>';
	});
}

var mark_see_previous_juan=function(line){
	line=line.replace(/（承上卷(\d+)）/,function(m,juan){
		return '<note_juan n="'+juan+'"/>';
	}).replace(/（承上卷(\d+)〈(.+)〉）/,function(m,juan,vagga){
		return '<note_juan n="'+juan+'" vagga="'+vagga+'"/>';
	}).replace(/（承上卷(\d+)～卷?(\d+)）/,function(m,juan,j2){
		return '<note_juan n="'+juan+'" n2="'+j2+'"/>';
	}).replace(/（承上卷(\d+)〈(.+)〉～卷?(\d+)）/,function(m,juan,vagga,j2){
		return '<note_juan n="'+juan+'" n2="'+j2+'" vagga="'+vagga+'"/>';
	}).replace(/（承上卷(\d+)（大正(\d+)，([0-9abc]+)-([0-9abc]+)））/,function(m,juan,vol,r1,r2){
		return '<note_juan n="'+juan+'" taisho="'+vol+'" from="'+r1+'" to="'+r2+'"/>';
	});
	return line;	
}

var replaceKai=function(content){
	return content.replace(/\^([\s\S]*?)\^\^/g,function(m,m1){
		return "<kai>"+m1+"</kai>";
	});
}

var otherMarkup=function(content) {
	return content.replace(/【<b>經<\/b>】/g,"<jin>經</jin>")
	.replace(/【<b>論<\/b>】/g,"<luan>論</luan>");
}

/*
//process line by line
var addRepeatKepan=function(content,fn) {
	var lines=content=content.split("\n");
	for (var i=0;i<lines.length;i++) {
		var line=lines[i];
		if (line.indexOf("承上卷")>0) {
			var h=line.indexOf("<h");
			if (h===-1) {
				//allerrors.push(fn+"ERROR has 承上卷 not in head line"+i+"\n"+line);
				//v48 hotfix 
			}
			lines[i]=line.replace(/<h(\d+)/,function(m,m1){
				return "<h"+m1+' repeat="true"';
			})
		}
	}
	return lines.join("\n");
}
*/

var process_ndef=function(content){
	var lines=content.split("\n");
	var started=false;

	for (var i=0;i<lines.length;i++) {
		var line=lines[i];
		if (lines[i].indexOf("<ndef")==-1 && !started) continue;
		started=true;
		line=mark_mpps_yinshun_note(line);
		line=mark_taisho(line);
		if (line!==lines[i]) lines[i]=line;
	}

	return lines.join("\n");
}
var processfile=function(fn){
	var out="";
	var content=fs.readFileSync(sourcepath+fn,'utf8');
	content=content.replace(/\r?\n/g,"\n");

	content=content.replace(/<B>/g,"<b>");
	content=content.replace(/<\/B>/g,"</b>");
	content=content.replace(/<b><\/b>/g,"");
	content=content.replace(/<u>\n<\/u>/g,"\n");

	content=replaceKai(content);

	content=processKepan(content);
	//deal with <b><H1>xxx\n<H2>xxx\n</b>
	


/*
	content=content.replace(/<\/h(\d+)>」/g,function(m,m1){
		return "」</h"+m1+">";
	});

	content=content.replace(/<\/kai><\/h(\d+)>/g,function(m,m1){
		return "</h"+m1+"></kai>";
	});
*/
	content=replacePb(content);


	content=fix_head(content);
	content=otherMarkup(content);

	content=dohotfix(content,fn);

	content=content.replace(/\$<h/g,"<h");
	content=content.replace(/\$<pb/g,"<pb");
	content=content.replace(/<kai>\$/g,"<kai>");
	content=content.replace(/\$<h/g,"<h");
	content=content.replace(/\$<pb/g,"<pb");
	content=content.replace(/\$<\/b/g,"</b");
	content=content.replace(/\$※/g,"※");
	content=content.replace(/<b><\/b>/g,"");
	content=content.replace(/<b><\/u><\/b>/g,"</u>");
	content=content.replace(/<u><\/u>/g,"");
	content=content.replace(/<u>\n<\/u>/g,"\n");


	var errors=validate(content,fn,2);//output has two extra line at the top
	content=process_ndef(content);
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
fs.writeFileSync("genxml/toc.txt",toc.join("\n"),"utf8");
fs.writeFileSync("genxml/errors.txt",allerrors.join("\n"),"utf8");