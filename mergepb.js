const fs=require("fs");

//word saveAs with InsertLineBreaks, foot note is lost
const target_path="./msword_pb_kai_kepan/xml/";

const lb_path="./msword_pb_kai_kepan/xml_lb/";

//extract footnote and crlf as paragraph breaks
const para_path="./msword_pb_kai_kepan/xml_para/";

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
	const paras=content_para.replace(/\u00a0/g," ").
	replace(/\r?\n/g,"\n").replace(/\r/g,"\n").split("\n");

	const lbs=content_lb.replace(/\r?\n/g,"\n").replace(/\r/g,"\n").split("\n")
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
			//unconsumed.push(fn+"\t"+line.length);
		}
		if (unconsumedcount>4){
			console.log(paras[i]);
			console.log(lbs[j-1]);
		}
		if(line.trim()) out[out.length-1]+=line;
	}
	if (unconsumedcount>4) {
		console.log(fn,unconsumedcount)
	}

	return out;
}
const processFile=function(fn){
	const notes=[],ndefs=[];
	var content_para=fs.readFileSync(para_path+fn,"utf8");
	const content_lb=fs.readFileSync(lb_path+fn,"utf8");


	content_para=content_para.replace(/!(\d+)/g,function(m,m1){
		notes.push(m1);
		return '<note n="'+m1+'"/>';
	})
	content_para=content_para.replace(/@(\d+)/g,function(m,m1){
		ndefs.push(m1);
		return '<ndef n="'+m1+'"/>';
	})

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
