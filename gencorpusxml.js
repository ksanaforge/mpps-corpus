var sourcepath="genxml/";
var lst='genxml/mpps.lst';
const targetpath='xml/';
var fs=require("fs");
var lst=fs.readFileSync(lst,"utf8").split(/\r?\n/);
//lst.length=10
var juan;
const addjin=require("./addjin");
const outputfilelist=[];
const prolog=function(content){
	content=content.replace(String.fromCharCode(0xFEFF),"")
	content=content.replace(
		/<note n="(\d+)"><a id="n\d+" href="#d\d+">\[\d+\]<\/a><\/note>/g,function(m,m1){
			return '<fn n="'+juan+"."+m1+'"/>';
	});
	content=content.replace(
		/<ndef n="(\d+)"><a id="d\d+" href="#n\d+">\[\d+\]<\/a><\/ndef>/g,function(m,m1){
			return '<def n="'+juan+"."+m1+'"/>';
	});
	content=content.replace(/<taisho \n?n="(.*?)"\/>/g,function(m,m1){
		return '<origin from="taisho@'+m1.replace(".","p")+'"/>';
	});	
	content=content.replace(/<pb n="(.*?)"><\/pb>/g,function(m,m1){
		return '<pb n="'+m1+'"/>';
	});	
	content=content.replace(/<note_mpps ref="(.*?)"><\/note_mpps>/g,function(m,m1){
		return '<link target="mpps@'+m1+'"/>';
	});	

	content=content.replace(/<note_taisho vol="(\d+)" pg="([ p\.abc\d\-]+)"><\/note_taisho>/g,function(m,v,pg){
		return '<link target="taisho@'+v+"p"+pg.replace("p.","").replace(" ","")+'"/>';
	});
	content=content.replace('<link rel="stylesheet" type="text/css" href="default_html.css" />\n','');
	content=content.replace('<html><script src="script.js"></script><meta charset="UTF-8"/>\n','');
	content=content.replace(/<s>(\d+)<\/s>/g,(m,m1)=>"^"+m1)
	content=content.replace(/<note_taisho vol="(\d+)" pg="([d\d]+)" n="([、，\.n\-\da]+)"><\/note_taisho>/g,function(m,v,pg,n){
		return '<link target="taishoapp@'+v+"p"+pg+"#"+n.replace(/[、，n\.]+/,"-")+'"/>';
	});		
	content=content.replace(/	+<body>/,"")

	//force pb start from begining of line
	content=content.replace(/([^\n])<pb/g,function(m,m1){
		return m1+"\n<pb"
	})

	content=content.replace(/<kai>\$\$/g,"<kai>");

	content=content.replace(/\$\$/g,"");

	content=addjin(content);
	return content;
}
const epilog=function(output,juan){//fix long head
	if (juan==38) {
		output=output.replace(/諸陀羅尼門、三昧門不能疾現在前<\/H6>\n<b><\/kai>」<\/b>/
			,"諸陀羅尼門、三昧門不能疾現在前<\/kai>」<\/H6>");
	} else if (juan==35) {
		output=output.replace(/後復說「<kai>但有名謂為菩提、菩薩、空<\/H3>\n<b><\/kai>」<\/b>/,
			"後復說「<kai>但有名謂為菩提、菩薩、空<\/kai>」<\/H3>");
	}else if (juan==7){
		const at=output.indexOf("七使與九十八結")	;
		if (at==-1) throw "long lines not found at end of juan 7"
		var longlines=output.substr(at).replace(/\n\n/g,"\n");
		longlines=longlines.replace(/\n?○+\n?/g,"");
		longlines=longlines.replace(/\n\n+/g,"\n");
		longlines=longlines.replace(/\n諦/g,"諦");
		longlines=longlines.replace(/\n道/g,"道");

		output=output.substr(0,at)+longlines;

	} else if (juan==23){
		output=output.replace(/\n<b>\n<pb n="660"\/><\/b>\n<p\/>\n\n/,'<pb n="660"/><p/>');

		const at=output.indexOf('<pb n="660"/>');
		if (at>-1 ) {
			output=output.substr(0,at)+require("./j23");
		} else {
			throw "cannot replace juan 23"
		}

	} else if (juan==90) {
		output=output.replace(/<svg src="M090.p2643.svg">\n+<\/svg>/,
			'<svg src="M090.p2643.svg">表格</svg>\n');
	} else if (juan==37) {

		output=output.replace(/菩薩不見有法出法性，乃至若法無有生滅相，云何有法當行般若波羅蜜<\/H2>\n<\/kai><b>」<\/b>/,
			"菩薩不見有法出法性，乃至若法無有生滅相，云何有法當行般若波羅蜜</kai>」</H2>");
	} else if (juan==1) {
		output=output.replace(/是等閻浮提大論議\n師\n/,"是等閻浮提大論議師\n");
		output=output.replace(/學習何<taisho \nn="25.61c"\/>經？<\/kai>/,
			'學習何<taisho n="25.61c"/>\n經？</kai>');
	} else if (juan==44) {
		output=output.replace(/（《大智度<\/H6>\n論筆記》/,"</H6>");
	} else if (juan==43) {
		output=output.replace(/（印順法師，《大智度論》筆記/g,"");
	} else if (juan==55) {
		output=output.replace(/（印順法師，《大智度論》筆記/g,"");
	}

	output=output.replace(/<link target="mpps@.+?"\/>/g,"");
	return output;
}
/* def to enclose entire foot note*/
const def_epilog=function(defs){
//	defs=defs.replace(/---------------\n\n------------------------------------------------------------\n\n---------------\n\n------------------------------------------------------------\n\n《大智度論》講義（第\d+期）\n\n第[一二三四五六七]冊：《大智度論》卷\d+ ?\n\n\d+\n\n\d+\n\n<\/body><\/html>\n?/g,"");
//	defs=defs.replace(/---------------\n\n------------------------------------------------------------\n\n---------------\n\n------------------------------------------------------------\n\n《大智度論》講義（第\d+期）\n\n第[一二三四五六七]冊：《大智度論》卷\d+ ?\n\n\d+\n\n\d+\n\n《大智度論》卷\d+\n\n<\/body><\/html>\n/g,"");
//	defs=defs.replace(/---------------\n\n------------------------------------------------------------\n\n---------------\n\n------------------------------------------------------------\n\n《大智度論》講義（第\d+期）\n\n　　　第七冊：《大智度論》卷\d+ ?\n\n\d+\n\n\d+\n\n<\/body><\/html>\n/g,"");
//	defs=defs.replace(/---------------\n\n------------------------------------------------------------\n\n---------------\n\n------------------------------------------------------------\n\n《大智度論》講義（第\d+期）\n\n第[一二三四五六七]冊：《大智度論》卷\d+ ?\n\n\d+\n\n\d+\n\n\d+\n\n<\/body><\/html>/g,"");
//	defs=defs.replace(/---------------\n\n------------------------------------------------------------\n\n---------------\n\n------------------------------------------------------------\n\n《大智度論》講義（第\d+期）\n\n第[一二三四五六七]冊：《大智度論》卷\d+ ?\n\n\d+\n\n\n\d+\n\n<\/body><\/html>\n/g,"");

	defs=defs.replace(/《大智度論》講義（第\d+期）[\s\S]+?<\/body><\/html>/g,"");
	defs=defs.replace(/<p\/>/g,"");

	//swap kai
	defs=defs.replace(/\n<kai><def n="([\d\.]+)"\/> ?/g,function(m,m1){
		return '\n<def n="'+m1+'"/><kai>';
	})
	defs=defs.replace(/\n<def n="([\d\.]+)"\/> ?/g,function(m,m1){
		return '</def>\n<def n="'+m1+'">';
	});
	defs=defs.replace(/<def n="89.11"\/>、/g,"、");//extra
	defs=defs.replace(/<def n="1.1"\/>/,'<def n="1.1">');
	defs=defs.replace(/<def n="0.1"\/>/,'<def n="0.1">');
	defs=defs.replace(/-+\n/g,'\n');

	defs=defs.trim()+"</def>";
	var opencount=0,closecount=0;
	defs.replace(/<def/g,function(){
		opencount++;
	})
	defs.replace(/<\/def>/g,function(){
		closecount++;
	})

	if (opencount!==closecount) {
		console.log("tag unmatch",opencount,closecount)
	}
	defs=defs.replace(/（印順法\n師，《大智度論筆 記》/g,"");
	defs=defs.replace(/（印順法師，《大智度論》筆記/g,"");


	defs=defs.replace(/<\/j>【論】/,"【論】");

	return defs;
}
var kepantreecount=0,kepancount=0;
const getSVGfn=function(id,count){
	const m=id.match(/(\d+)\.(\d+)/);
	var group='00'+m[1],n='00'+m[2];
	group=group.substring(group.length-3);
	n=n.substring(n.length-3);
	return 'M'+group+"."+n+((count>1)?"-"+count:"");
}
const xml2htll=function(def,id){
	def=def.replace(/<link target="(.+?)"\/>/g,function(m,m1){
		m1=m1.replace(/taisho@/,"t");
		m1=m1.replace(/taishoapp@/,"a");
		m1=m1.replace(/mpps@/,"y");
		return "@"+m1;
	})
	def=def.replace(/<kai>/g,"{k");
	def=def.replace(/<\/kai>/g,"k}");
	def=def.replace(/<b>/g,"{b");
	def=def.replace(/<\/b>/g,"b}");
	var count=0;
	if (def.indexOf("svg")>-1){
		def=def.replace(/<svg>([\S\s]+?)<\/svg>/g,function(m,m1){
			const svgfn=getSVGfn(id,++count);
			return "{svg|"+svgfn+","+m1+"|svg}";				
		});

		def=def.replace(/<svg2>([\S\s]*?)<\/svg2>/g,function(m,m1){
			const svgfn=getSVGfn(id,++count);
			if (!m1) m1=" ";
			return "{svg|"+svgfn+","+m1+"|svg}";
		});
	}
	


	if (def.indexOf("<")>-1 ) {
		console.log(def.substr(def.indexOf("<"),50));
		console.log("has html tag in defs",id)
	}
	//def=def.replace(/>/g,"＞");

	return def
}
const convertdef2json=function(defs){
	const out={};
	defs.replace(/<def n="([\d\.]+)">([\s\S]+?)<\/def>/g,function(m,m1,t){
		out[m1]=xml2htll(t,m1);
	})
	return JSON.stringify(out,""," ");
}
const treename=require("./treename");
kepanmap=require("./kepan-map.json");
const processhead=function(headline){
	var prefix="";
	if (headline.indexOf('start="1"')>-1){
		prefix='<H0 n="'+(kepantreecount+1)+'">'+treename[kepantreecount]+"</H0>\n";
		kepantreecount++;
		kepancount=0;
		headline=headline.replace(/ start="1"/,"");
	} else {
		kepancount++;
	}

	var kid=kepantreecount+"."+kepancount;

	headline=headline.replace(/<H(\d+)/,function(m,m1){
		const target=(kepanmap[kid])?' to="'+kepanmap[kid]+'"':"";
		return '<a n="'+kid+'"/><H'+m1+target;
	});
	return prefix+headline;
}
var maxchar=0;
var defs=[];
/*
const fixlongline=function(line){
	line=line.replace('但為此故，以方便力',"\n但為此故，以方便力");
	line=line.replace('是時，弗沙佛如是思惟',"\n是時，弗沙佛如是思惟");

	line=line.replace('阿婆迦，非摩伽婆，','\n阿婆迦，非摩伽婆，');
	line=line.replace('非末殊夜摩，非三摩陀','\n非末殊夜摩，非三摩陀');
	line=line.replace('非迦羅跋，非呵婆跋，非鞞婆跋','\n非迦羅跋，非呵婆跋，非鞞婆跋');
	line=line.replace('非為一國土微塵等眾生故發心','\n非為一國土微塵等眾生故發心');
	line=line.replace('（10）金剛三昧','\n（10）金剛三昧');
	line=line.replace('（20）不妄三昧','\n（20）不妄三昧');
	line=line.replace('（30）無邊明三昧','\n（30）無邊明三昧');
	line=line.replace('（40）不動三昧','\n（40）不動三昧');
	line=line.replace('（50）遍照三昧','\n（50）遍照三昧');
	line=line.replace('（60）離字三昧','\n60）離字三昧');
	line=line.replace('（70）住無心三昧','\n（70）住無心三昧');
	line=line.replace('（80）生行三昧、','\n（80）生行三昧、');
	line=line.replace('（90）一切種妙足三昧','\n（90）一切種妙足三昧');
	line=line.replace('（100）大莊嚴三昧、','\n（100）大莊嚴三昧、');


	//line.split("\n").map(l=>console.log(l.length)); make sure less than 256

	//console.log(line);
	return line
}
*/
var processfile=function(fn){
	var indef=false,defstart=0;
	juan=parseInt(fn.substr(sourcepath));
	group=0;
	var content=fs.readFileSync(sourcepath+fn,"utf8").trim();
	content=prolog(content);
	var lines=content.split(/\r?\n/);
	
	for (var i=0;i<lines.length;i++) {
		var line=lines[i];
		if (line.indexOf("<H")>-1) {
			line=processhead(line);
		}

		if (!indef && line.indexOf("<def")>-1) {
			defstart=i;
			indef=true;
		}

		if (indef) {
			defs.push(line);
		} else {
			const chars=(line.replace(/<.*?>/g,"")).length;
			if (chars>maxchar) {
				maxchar=chars;
				//if (maxchar>254) line=fixlongline(line);
			}
			lines[i]=line;
		}
	}

	lines.length=defstart;
	const ofn=fn.replace(".html",".xml");
	outputfilelist.push(ofn)

	output=lines.join("\n").trim();

	var juanname=fs.readFileSync("juanname.txt","utf8").split(/\r?\n/);
	juanname=juanname.map(juan=>juan.replace(/\d+=/,""))
	output=output.replace(/慧日佛學班第\d+期/,"");
	output=output.replace(/／福嚴推廣教育班第24期/g,"");
			
	output=output.replace(/<b>《大智度論》卷(\d+)\n/,function(m,m1){
		return "<article>卷"+m1+"："+juanname[parseInt(m1)-1]+"</article>\n<b>";
	})
	output=epilog(output,juan);
	fs.writeFileSync(targetpath+ofn,"<file>"+output+"</file>","utf8");
}
lst.forEach(processfile)
console.log("maxchar",maxchar);
const alldef=def_epilog(defs.join("\n"));
fs.writeFileSync(targetpath+"footnotes.xml",alldef,"utf8");
fs.writeFileSync(targetpath+"footnotes.json",convertdef2json(alldef),"utf8");
fs.writeFileSync(targetpath+"filelist.lst",outputfilelist.join("\n"),"utf8");
