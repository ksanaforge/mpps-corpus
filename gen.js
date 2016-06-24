/*
	input: xml generated from docx
	output: TEI
*/
"use strict";
var fs=require("fs");
var sourcepath="msword_pb_kai/xml/";
var lst=fs.readFileSync(sourcepath+"files.lst","utf8").split(/\r?\n/);
var validate=require("ksana-master-format/validatexml");
var allerrors=[];
var toc=[];
var writeToDisk=true;
lst.length=1;

var replacePb=function(content){
	return content.replace(/`(\d+)`/g,function(m,m1){
		return '<pb n="'+m1+'"/>';
	});
}

var hotfixes={
	1:[
	['<h4 t="（一）">外人執著<h3 t="一">異</h4></h3>',
	'<h4 t="（一）">外人執著一、異</h4>']
	]
	,2:[
	['<kai><jin>經</jin><b>婆伽婆</kai></b>','<kai><jin>經</jin><b>婆伽婆</b></kai>']
	]
	,25:[[
	'<b>第<h3 t="三">第四無畏</h3>','<b>第三、第四無畏']]
//	,28:[
//	['<B>Ｂ、變化諸物</B>','<b><h7 t="B">變化諸物</h7></b>']
//	]
	,36:[
	['<h9 t="b">二種色</h9><H6 t="（13）">','<h9 t="b">二種色（13）</h9>'],
	['<h9 t="c">三種色</h9><H6 t="（3）">','<h9 t="c">三種色（3）</h9>'],
	['<h9 t="d">四種色</h9><H6 t="（4）">','<h9 t="d">四種色（4）</h9>'],
	['<h9 t="e">五種色</h9><H6 t="（3）">','<h9 t="e">五種色（3）</h9>'],
	['<h8 t="（B）">二種受</h8><H6 t="（5）">','<h8 t="（B）">二種受（5）</h8>'],
	['<h8 t="（C）">三種受</h8><H6 t="（7）">','<h8 t="（C）">三種受（7）</h8>'],
	['<h8 t="（D）">四種受</h8><H6 t="（4）">','<h8 t="（D）">四種受（4）</h8>'],
	['<h8 t="（E）">五種受</h8><H6 t="（3）">','<h8 t="（E）">五種受（3）</h8>']
	]
	,48:[
		['<b>　　（一）六度是摩訶衍</b>','<h4 t="（一）">六度是摩訶衍</h4>'],
		['<b>（二）十八空、四空是摩訶衍</b>','<h4 t="（二）">十八空、四空是摩訶衍</h4>'],
		['<b>（三）百八三昧是摩訶衍</b>','<h4 t="（三）">百八三昧是摩訶衍</h4>'],
		['<b>（四）三十七道品是摩訶衍</b>','<h4 t="（四）">三十七道品是摩訶衍</h4>'],
		['<b>　　</b>','']
	]
	,56:[
		['<H3 t="二、"><b>明有方便行</b>','<h3 t="二、">明有方便行</h3>']
	]
	,63:[
		[/<H3 t="一、"><b>以七因緣、八因緣故難信難解<\/b>/g,'<h3 t="一、">以七因緣、八因緣故難信難解</h3>']
	]
	,64:[
		['<H3 t="一、"><b>歎般若法</b>','<h3 t="一、">歎般若法</h3>'],
	]
	,73:[
	['<H3 t="二、"><b>佛述：入諸法如相，如實知諸地，無二無別</b>',
	'<h3 t="二、">佛述：入諸法如相，如實知諸地，無二無別</h3>']
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

var ReplaceAllKewen=function(content,pat,depth) {//first pass, endtag not found yet
	var reg=new RegExp("^"+pat,"g");
	var lines=content.split("\n"),i,line;

	for (i=0;i<lines.length;i++) {
		line=lines[i];
		if (line.indexOf("<ndef")>-1) break; //no kepan after first ndef
		lines[i]=line.replace(reg , function(m,m1,idx){
				return "<H"+depth+' t="'+m1+'">';	
		});
	}

	var reg2=new RegExp("^<b>"+pat,"g");
	for (i=0;i<lines.length;i++) {
		if (lines[i].indexOf("<ndef")>-1) break;
		lines[i]=lines[i].replace(reg2 , function(m,m1){
			return "<b><H"+depth+' t="'+m1+'">';
		});
	}

	var reg3=new RegExp("^<kai><b>"+pat,"g");
	for (i=0;i<lines.length;i++) {
		if (lines[i].indexOf("<ndef")>-1) break;
		lines[i]=lines[i].replace(reg3 , function(m,m1){
			return "<kai><b><H"+depth+' t="'+m1+'">';
		});
	}
/*
	var reg4=new RegExp("^`([0-9]+)`"+pat,"g");
	for (i=0;i<lines.length;i++) {
		if (lines[i].indexOf("<ndef")>-1) break;
		lines[i]=lines[i].replace(reg4 , function(m,pb,m1){
			return '<pb n="'+pb+'"/><H'+depth+' t="'+m1+'">';
		});
	}
*/
	var reg5=new RegExp("^<b>`([0-9]+)`"+pat,"g");
	for (i=0;i<lines.length;i++) {
		if (lines[i].indexOf("<ndef")>-1) break;
		lines[i]=lines[i].replace(reg5 , function(m,pb,m1){
			return '<b><pb n="'+pb+'"/><H'+depth+' t="'+m1+'">';
		});
	}

	return lines.join("\n");
}
var processKepan=function(content) {//move from vbscript
	content=ReplaceAllKewen(content,"([壹貳参參肆伍陸柒捌玖拾～]+、)", 1);
	content=ReplaceAllKewen(content,"(（[壹貳参參肆伍陸柒捌玖拾～]+）)", 2);
	content=ReplaceAllKewen(content,"([一二三四五六七八九十～]+、)", 3);
	content=ReplaceAllKewen(content,"(（[一二三四五六七八九十～]+）)", 4);
	  
	content=ReplaceAllKewen(content,"([0-9]{1,2}、)", 5);

	content=ReplaceAllKewen(content,"(（[0-9]{1,2}）)", 6);
	content=ReplaceAllKewen(content,"([ABCDEFGHIJKLMNOPQRSTUVWXYZ]、)", 7);
	content=ReplaceAllKewen(content,"(（[ABCDEFGHIJKLMNOPQRSTUVWXYZ]）)", 8);
	content=ReplaceAllKewen(content,"([abcdefghijklmnopqrstuvwxz]、)", 9);
	content=ReplaceAllKewen(content,"(（[abcdefghijklmnopqrstuvwxz]）)", 10);
	content=ReplaceAllKewen(content,"([ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ]、)", 11);
	content=ReplaceAllKewen(content,"(（[ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ]）)", 12);
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
	return line.replace(/（?印順法師，《?大智度論筆記》[〔［](.+?)[〕］]p\.(\d+)）/,function(m,bk,pg){
		return '<note_mpps bk="'+bk+'" pg="'+pg+'"/>';
	});
}

var mark_taisho=function(line) {
	return line.replace(/（大正(\d+)，(.+?)，n\.(.+?)）/g,function(m,vol,pg,sutra){
		return '<note_taisho vol="'+vol+'" pg="'+pg+'" n="'+sutra+'"/>';
	}).replace(/（大正(\d+)，(.+?)）/,function(m,vol,pg){
		return '<note_taisho vol="'+vol+'" pg="'+pg+'"/>';
	});
}

var mark_see_previous_juan=function(line){
	line=line.replace(/（承上卷(\d+)）/,function(m,juan){
		return '<note_juan n="'+juan+'">';
	}).replace(/（承上卷(\d+)〈(.+)〉）/,function(m,juan,vagga){
		return '<note_juan n="'+juan+'" vagga="'+vagga+'">';
	}).replace(/（承上卷(\d+)～卷?(\d+)）/,function(m,juan,j2){
		return '<note_juan n="'+juan+'" n2="'+j2+'">';
	}).replace(/（承上卷(\d+)〈(.+)〉～卷?(\d+)）/,function(m,juan,vagga,j2){
		return '<note_juan n="'+juan+'" n2="'+j2+'" vagga="'+vagga+'">';
	}).replace(/（承上卷(\d+)（大正(\d+)，([0-9abc]+)-([0-9abc]+)））/,function(m,juan,vol,r1,r2){
		return '<note_juan n="'+juan+'" taisho="'+vol+'" from="'+r1+'" to="'+r2+'"/>';
	});
	return line;	
}
var closeKepan=function(content,fn){
	var lastdepth=0;
	content=content.replace(/<b>\n/g,"\n<b>");//move </b> at begin of line to previos end of line
	content=content.replace(/\n<\/b>/g,"</b>\n");//move </b> at begin of line to previos end of line
	//content=content.replace(/<b><\/b>/g,"");//not needed

	//remove extra </b> <b> caused by note
	content=content.replace(/<\/b><note n="(.+?)"\/><b>/g,function(m,m1){
			return '<note n="'+m1+'"/>'
	});


	var lines=content.split("\n");

	var kepangroup=0;
	for (var i=0;i<lines.length;i++) {
		var line=lines[i];
		if (line.indexOf("<H")==-1) { //end of group
			if (kepangroup) { //previous line is end of group

			}
			kepangroup=0;
			continue;
		}

		if (!kepangroup) { //first in the group
			if (line.indexOf("<b>")==-1) {
				//console.log("no b not a group",line);
				//restore

				lines[i]=line.replace(/<H(\d+) t="(.+?)">(.+)/g,function(m,d,t,text,idx){
					return "*b"+t+text;//restore;
				});

				continue;
			}
		}

		kepangroup++;
		//extra <b></b> caused by kai

		line=line.replace(/<\/b><kai><b>(.+?)<\/b><\/kai><b>/g,function(m,m1){
			return "<kai>"+m1+"</kai>";
		});

		line=line.replace(/<H(\d+) t="(.+?)">(.+)/g,function(m,d,t,text,idx){
			d=parseInt(d,10);
			if ( d==6 && (d>lastdepth+1)) {
				//console.log("restore",text)
				return "**"+t+text;//restore;
			}
			lastdepth=d;
			
			return "<h"+d+' t="'+t+'">'+text+"</h"+d+">";
		});


		//remove <b> </b> pair
		if (matchcount(line,"<b>")==1 && matchcount(line,"</b>")==1) {
			line=line.replace(/<\/?b>/g,"");
		}

		line=mark_mpps_yinshun_note(line);
		line=mark_see_previous_juan(line);

	//fix overlap </b> </h
		line=line.replace(/<\/b><\/h(\d+)>/g,function(m,m1){return "</h"+m1+"></b>"});
		line=line.replace(/<\/b><note(.+?)><\/h(\d+)>/g,function(m,note,m1){return "<note"+note+"></h"+m1+"></b>"});

		toc.push(fn.substr(0,3)+"#"+i+"\t"+line);
		lines[i]=line;
	}

	content=lines.join("\n");
	content=content.replace(/<b><\/b>/g,"");


//fixes </kai><mpps_note bk="E022" pg="321"/></h4>\n<kai>
	content=content.replace(/<\/kai><note(.+?)><\/h(\d+)>\n<kai>/g,function(m,note,lv){
		return "<note"+note+"></h"+lv+">\n";
	});

	content=content.replace(/<\/b><note(.+?)><\/h(\d+)>/g,function(m,note,m1){
		return "<note"+note+"></h"+m1+"></b>"
	});


	//content=content.replace(/<b><h/g,"<h");
	//content=content.replace(/<\/b><\/h/g,"</h");
	return content;
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

	content=replaceKai(content);

	content=processKepan(content);
	//deal with <b><H1>xxx\n<H2>xxx\n</b>


	content=closeKepan(content,fn);

	content=replacePb(content);


	content=fix_head(content);
	content=otherMarkup(content);

	content=dohotfix(content,fn);


	var errors=validate(content,fn,2);//output has two extra line at the top
	content=process_ndef(content);
	out=content;
	out=`<?xml-stylesheet type="text/css" href="default.css" ?>
			<html><script src="script.js"></script><meta charset="UTF-8"/>
			<body>`+out+"</body></html>";

	var newfn=fn.replace("-pb-kai.docx.xml",".xhtml");
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