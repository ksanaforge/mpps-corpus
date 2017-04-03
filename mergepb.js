const fs=require("fs");

//word saveAs with InsertLineBreaks, foot note is lost
const target_path="./msword/xml/";

const lb_path="./msword/xml_lb/";

//extract footnote and crlf as paragraph breaks
const para_path="./msword/xml_para/";

const xml_files=fs.readFileSync(target_path+"files.lst","utf8").split(/\r?\n/);
//xml_files.shift();
//for(var i=0;i<7;i++) {
//	xml_files.shift();
//}

//xml_files.length=1;
const unconsumed=[];

//give up adding <p/>cannot make it.. 2017/3/24
const insertP=function(content_para,content_lb,fn){
	const out=[];

	//non breaking space in 050 and 053
	const paras=content_para.replace(/\u00a0/g," ").split("\n");

	const lbs=content_lb.split("\n")
	var j=0,unconsumedcount=0;
	for (var i=0;i<paras.length;i++) {
		var line=paras[i];

		var lbline=lbs[j];
		
		if (lbline==line){
			j++;
			out.push(line);
			continue;
		}
		if (j==lbs.length) {
			break;
		}
		var c=0;
		var l1=lbline.trim();
		var l2=line.substr(0,lbline.length).trim();
/*
		if (l1=='<ndef n="124"/><svg>			┌	一法是地，餘三應非') {
			debugger
		}
*/
		while (l1==l2) {
			out.push((c==0?"<p/>":"")+lbline);
			line=line.substr(lbline.length);
			j++;
			lbline=lbs[j];
			c++;
			l1=lbline.trim();
			l2=line.substr(0,lbline.length).trim();
		}
		if (line.trim().length) {
			unconsumedcount++
			//console.log(line)
			//unconsumed.push(fn+"\t"+line.length);
		}
		if (unconsumedcount>4){
			debugger
			console.log(paras[i]);
			console.log(lbs[j-1]);
		}
		if(line.trim()) {
			out[out.length-1]+=line;
		}
	}
	if (unconsumedcount>4) {
		console.log(fn,unconsumedcount)
	}

	return out;
}
const prolog=function(content){
	content=content.replace(/\r?\n/g,"\n").replace(/\r/g,"\n");

	content=content.replace(/!!([\s\S]+?)!!/g,function(m,m1){
		if (m1.length>500) {
			console.log("possible wrong table",m1)
		}
		return "<svg>"+m1+"</svg>"
	});
	content=content.replace(/!@([\s\S]*?)@!/g,function(m,m1){//might be no space
		return "<svg2>"+m1.trim()+"</svg2>"
	});
	content=content.replace(/<svg src=" /g,'<svg src="');
	content=content.replace(/<\/\n品>/g,"</品>");
	content=content.replace(/\n<\/品>/g,function(){
		return "</品>"
	});//pin should not wrap

	content=content.replace(/<\/品\n>/g,function(){
		return "</品>"
	});//pin should not wrap

	//remove line breaks between 品
	content=content.replace(/<品 (.+?)>([\s\S]+?)<\/品>/g,function(m,m1,m2){
		return "<pin "+m1.replace(/\n/g,"")+"/>"+m2.replace(/\n/g,"");
	})

	if (content.indexOf("<品")>-1){
		console.log(content.length)
		throw "unclean 品"
	}
	return content;
}
const processFile=function(fn){
	const notes=[],ndefs=[];
	var content_para=fs.readFileSync(para_path+fn,"utf8");
	var content_lb=fs.readFileSync(lb_path+fn,"utf8");

	content_para=prolog(content_para);
	content_lb=prolog(content_lb);

	if (parseInt(fn,10)==18) { //hot fix for missing 18.124

		content_para=content_para.replace('@ <svg>			┌	一法是地，餘三應非'
			,'@124 <svg>			┌	一法是地，餘三應非');

		content_lb=content_lb.replace('@ <svg>			┌	一法是地，餘三應非'
			,'@  <svg>			┌	一法是地，餘三應非');

		//content_para=content_para.replace('<svg>			┌	一法是地，餘三應非',
		//	'@124 <svg>			┌	一法是地，餘三應非');
		//content_lb=content_lb.replace('<svg>			┌	一法是地，餘三應非',
		//	'@ <svg>			┌	一法是地，餘三應非');


		//const i=content_para.indexOf("@124");
		//const i2=content_lb.indexOf("┌	一法是地，餘三應非");
	}

	if (parseInt(fn,10)==11) {
		//don't know why extension B convert to ??
		content_lb=content_lb.replace("??：車轎上的惟幔","𨏥：車轎上的惟幔");
	}


	content_para=content_para.replace(/!(\d+)/g,function(m,m1){
		notes.push(m1);
		return '<note n="'+m1+'"/>';
	})
	content_para=content_para.replace(/@(\d+)/g,function(m,m1){
		ndefs.push(m1);
		return '<ndef n="'+m1+'"/>';
	})

	if (notes.length!==ndefs.length) {
		for (var i=0;i<notes.length;i++) {
			if (notes[i]!==ndefs[i]) {
				debugger
				console.log("unmatch at"+i,fn);
			}
		}
		throw "notes ndefs unmatch"
	}
	var content=content_lb.replace(/! /g,function(m){
		return '<note n="'+notes.shift()+'"/>';
	});

	content=content.replace(/@ /g,function(m){
		return '<ndef n="'+ndefs.shift()+'"/>';
	});

	if (notes.length){
		console.log(fn,"unconsumed notes",notes.length);
	}
	if (ndefs.length){
		console.log(fn,"unconsumed ndefs",ndefs.length);
	}

	content=insertP(content_para,content,fn).join("\n");

	content=content.replace(/n=“([\d\.a-d]+)”/g,function(m,m1){
		return 'n="'+m1+'"';
	})

	content=content.replace(/<u>\n<\/u>/g,"\n");
	content=content.replace(/<u>\n<p\/><\/u>/g,"\n");

	content=content.replace(/<p\/><\/b>/g,"</b><p/>");
	fs.writeFileSync(target_path+fn,content,"utf8");
}


xml_files.forEach(processFile);
fs.writeFileSync("unconsumed.txt",unconsumed.join("\n"),"utf8");
