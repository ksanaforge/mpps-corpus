/*
	input: xml generated from docx
	output: TEI
*/
var fs=require("fs");
var sourcepath="msword_pb_kai/xml/";
var lst=fs.readFileSync(sourcepath+"files.lst","utf8").split(/\r?\n/);
var validate=require("./validate");
var allerrors=[];
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
	['<kai>【<b>經</b>】<b>婆伽婆</kai></b>','<kai>【<b>經</b>】<b>婆伽婆</b></kai>']
	]
	,25:[[
	'<b>第<h3 t="三">第四無畏</h3>','<b>第三、第四無畏</b>']]
	,28:[
	['<B>Ｂ、變化諸物</B>','<b><h7 t="B">變化諸物</h7></b>']
	]
	,98:[//don't know why replace to uppercase <B>
	['<B><H7 T="A">捨家求佛道，不攜財物故','<b><h7 t="A">捨家求佛道，不攜財物故</h7></b>'],
	['</B>有人言：此人捨家求佛道，雖生富家','有人言：此人捨家求佛道，雖生富家'],
	['<B><H7 T="A">法供養雖上，隨世間法故求供養具','<b><h7 t="A">法供養雖上，隨世間法故求供養具</h7></b>'],
	['</B>法供養雖上，而世間眾生','法供養雖上，而世間眾生']

	]
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
var replaceHead=function(content){
	/*
	return content.replace(/<b><H(\d+) t="(.+?)">(.+?)<\/b>/g,function(m,m1,t,m2){
		return "<h"+m1+' t="'+t+'">'+m2+"</h"+m1+">";
	}).replace(/<b>`(\d+)`<H(\d+) t="(.+?)">(.+?)<\/b>/g,function(m,pb,m1,t,m2){
		return '<pb n="'+pb+'"/>'+"<h"+m1+' t="'+t+'">'+m2+"</h"+m1+">";
	}).replace(/<H(\d+) t="(.+?)">(.+?)<\/b>/g,function(m,m1,t,m2){
		return "<h"+m1+' t="'+t+'">'+m2+"</h"+m1+"></b>";
	}).replace(/<b><H(\d+) t="(.+?)">(.+)/g,function(m,m1,t,m2){
		return "<h"+m1+' t="'+t+'">'+m2+"</h"+m1+"><b>";
	}).replace(/<b>`(\d+)`<H(\d+) t="(.+?)">(.+)/g,function(m,pb,m1,t,m2){
		return '<pb n="'+pb+'"/>'+"<h"+m1+' t="'+t+'">'+m2+"</h"+m1+"><b>";
	});
	*/
	return content.replace(/<H(\d+) t="(.+?)">([^<]+)/g,function(m,m1,t,m2){
		return "<h"+m1+' t="'+t+'">'+m2+"</h"+m1+">";
	});
}

var replaceKai=function(content){
	return content.replace(/\^([\s\S]*?)\^\^/g,function(m,m1){
		return "<kai>"+m1+"</kai>";
	});
}
var removeRepeatKepan=function(content) {
	return content.replace(/<H.*?（承上卷\d+）\n/g,"");
}
var processfile=function(fn){
	var out="";
	var content=fs.readFileSync(sourcepath+fn,'utf8');
	content=content.replace(/\r?\n/g,"\n");

	content=content.replace(/\n<\/b>/g,"</b>\n");
	content=content.replace(/<b>\n/g,"\n<b>");


	//deal with <b><H1>xxx\n<H2>xxx\n</b>
	content=replaceHead(content);
	content=content.replace(/\n<\/b>/g,"</b>\n");
	content=content.replace(/<b>\n/g,"\n<b>");
	content=replaceHead(content);
	content=content.replace(/\n<\/b>/g,"</b>\n");
	content=content.replace(/<b>\n/g,"\n<b>");
	content=replaceHead(content);
	content=content.replace(/\n<\/b>/g,"</b>\n");
	content=content.replace(/<b>\n/g,"\n<b>");
	content=replaceHead(content);
	content=content.replace(/\n<\/b>/g,"</b>\n");
	content=content.replace(/<b>\n/g,"\n<b>");

	content=content.replace(/<b><\/b>/g,"");
	content=content.replace(/<b>\n<\/b>/g,"");


	content=replacePb(content);
	content=replaceKai(content);

	content=removeRepeatKepan(content);

	content=content.replace(/\n<\/b>/g,"</b>\n");
	content=content.replace(/<b>\n/g,"\n<b>");

	content=dohotfix(content,fn);

	var errors=validate(content,fn,2);//output has two extra line at the top

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
	fs.writeFileSync("genxml/"+newfn,out,"utf8");
	
	
}

lst.length=37;
lst.forEach(processfile);

fs.writeFileSync("genxml/errors.txt",allerrors.join("\n"),"utf8");