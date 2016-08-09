
var processKepan=function(content,fn) {//move from vbscript
	content=content.replace(/\n<\/b>/g,"</b>\n");

	var lines=	content.split("\n");
//1 and 2 have higher precedent for juan 090 
//（貳）以方便力安立眾生於實際，而眾生際、實際不一、不異
/*
	lines=ReplaceAllKewen(lines,"(（[壹貳参參肆伍陸柒捌玖拾～]+）)", 2);
	lines=ReplaceAllKewen(lines,"([壹貳参參肆伍陸柒捌玖拾～]+、)", 1);

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

	lines=processExtraKepan(lines,fn);//因論生論
*/
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
			4 （四）第一義悉檀 (卷1)
5 〔第一偈〕 (卷1)
5 〔第二偈〕 (卷1)
5 1、世間凡夫 (卷1)
5 2、外道 (卷1)
5 3、內道 (卷1)
6 （1）舉犢子部的說法 (卷1)
6 （2）舉說一切有部的說法 (卷1)
6 （3）舉方廣部的說法 (卷1)
7 ※ 小結 (卷1)
7 〔第三偈〕 (卷1)


var processExtraKepan=function(lines,fn) { //因論生論
	var depth=0;
	for (var i=0;i<lines.length;i++) {
		var line=lines[i];
		var h=line.indexOf("<h");
		if (h>0) {
			var m=line.match(/<h(\d+)/);
			depth=parseInt(m[1]);

			if (line.indexOf("$$")>-1) {
				line=line.replace("$$","");
				line=line.replace(/<h(\d+) (.+?)>/,function(m,d,m1){return "<h"+d+' repeat="true" '+m1+">"});
				//if (line.indexOf("<note")==-1) {
					//console.log("warning repeat kepan without note",fn)
				//}
			}
		} else if (line.indexOf("$")>-1) {
			//error 
			line=line.replace(/\$([^<]+)(.*)/,function(m,m1,m2){
				return "<h"+(depth+1)+">"+m1+"</h"+(depth+1)+">"+m2;
			});		
		}
		if (line!==lines[i])			lines[i]=line;

	}
	return lines;
}
*/


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


var ReplaceAllKewen=function(lines,pat,depth) {//first pass, endtag not found yet
	var reg=new RegExp(pat,"");
	var i,line;
	var bold=false,lastidx=0,prevdepth=0;

	for (i=0;i<lines.length;i++) {
		line=lines[i];
		if (line.indexOf("<ndef")>-1) break; //no kepan after first ndef

		if (line.indexOf("$")==-1) continue;
		if (line.indexOf("<h")>-1) continue; //already parse


		line=Text2Tag.mark_mpps_yinshun_note(line);
		line=Text2Tag.mark_see_previous_juan(line);
		
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


var process_ndef=function(content){
	var lines=content.split("\n");
	var started=false;

	for (var i=0;i<lines.length;i++) {
		var line=lines[i];
		if (lines[i].indexOf("<ndef")==-1 && !started) continue;
		started=true;
		if (line!==lines[i]) lines[i]=line;
	}
	return lines.join("\n");
}