/* Extract Taisho Text from MPPS
preparation for diff with Taisho */

/*
  input gen/*.xml
  output
     array of  ["taisho_address","text\ntext"
     standoffs {"taisho_address":[ offset, content ]}
*/

const Sax=require("sax");
var lst='genxml/mpps.lst';
var fs=require("fs");
const sourcepath="genxml/";
var lst=fs.readFileSync(lst,"utf8").split(/\r?\n/);
//lst.length=2;
var pb="25.57c";
var tagstack=[],capturing=false,indef=false;
var text="",captured="";

var taishotext=[] , standoffs=[] , offset=0;

const emittaisho=function(){
	taishotext.push([pb,text]);
	text="";
	offset=0;
}
const emitstandoff=function(){
	standoffs.push([pb,offset,captured]);
	captured="";
}
const buildfulltag=function(tag,isSelfClosing){
	var opentag=tag.name;
	if (tag.attributes && Object.keys(tag.attributes).length) {
		for (var key in tag.attributes){
			opentag+=" "+key+'="'+tag.attributes[key]+'"';
		}
	}
	return "<"+opentag+ (isSelfClosing?"/":"")+">";
}
var subtreecount=0;
var subkepan=[];
var kepan=[];
var treename=require("./treename");
const on_H=function(tag,closing){
	if (closing) {
		captured+="</"+tag.name+">";
		capturing=false;

		if (tag.attributes.start=="1") {
			kepan=kepan.concat(subkepan);
			subtreecount++;
			subkepan=[0+"\t"+subtreecount+"\t"+treename[subtreecount-1]];
		}
		//補上 id 供之後的經論科判對應
		const kepanid=subtreecount+"."+(subkepan.length-1);

		const depth=parseInt(tag.name.substr(1),10);
		const k=captured.match(/<H.+?>(.+?)<\/H/)[1];	
		subkepan.push(depth+"\t"+kepanid+"\t"+k);
		

		captured=captured.replace(/<H(.+?)>/,function(m,m1){return '<H'+m1+' id="'+kepanid+'">'});

	} else {
		captured+=buildfulltag(tag);
		capturing=true;
	}
}
const defaulthandler=function(tag,closing) {
	if (tag.isSelfClosing ) {
		if (closing)return;//nothing to do
		if (Object.keys(tag.attributes).length==0) {
			captured+="<"+tag.name+"/>";	
		} else {
			captured+=buildfulltag(tag,true);
		}
		
		return;
	}
	if (closing) {
		captured+="</"+tag.name+">";
	} else {
		captured+=buildfulltag(tag);
	}
}
const on_taisho=function(tag,closing){
	if (!closing) {
		if (pb!=tag.attributes.n) emittaisho();
		pb=tag.attributes.n;
	}
}
const on_ndef=function(tag,closing){
	indef=true;
	defaulthandler(tag,closing);
}
const handlers={
	H1:on_H,H2:on_H,H3:on_H,H4:on_H,H5:on_H,H6:on_H,H7:on_H,H8:on_H,H9:on_H,H10:on_H,
	H11:on_H,H12:on_H,H13:on_H,H14:on_H,H15:on_H,H16:on_H,H17:on_H,H18:on_H,H19:on_H,H20:on_H,
	H21:on_H,H22:on_H,H23:on_H,H24:on_H,H25:on_H,H26:on_H,H27:on_H,H28:on_H,H29:on_H,H30:on_H,
	ndef:on_ndef,
	taisho:on_taisho
}
const preprocess=function(s){
	//讓<taisho 重起一行，否則上一頁最後一個標誌會變成這頁
	var o=s.replace(/<taisho n/g,"\n<taisho n"); 
	//將 <note><a>x</a></note> 改為 <note n=""/> ，減少 diff 的差異
	o=o.replace(/<note n="(\d+)"><a id="n\d+" href="#d\d+">\[\d+\]<\/a><\/note>/g,function(m,m1){
		return '<note n="'+m1+'"/>';
	});

	//丟去包 H 的 kai 
	o=o.replace(/<kai>(<H.+?>)<\/kai>/g,function(m,m1){
		console.log("extra kai enclosing H",m);
		return m1;
	})
	o=o.replace(/慧日佛學班第\d+期/g,"");
	o=o.replace(/釋厚觀（[\d\.]+）/g,"");
	o=o.replace(/\$\$.*?\n/g,"");//去掉承上卷

	return o;
}
const processfile=function(fn){
	console.log("processing",fn)
	const content = preprocess(fs.readFileSync(sourcepath+fn,"utf8"));

/*"25.61a",0,"<note n=\"96\">
  應是
  "25.60c",308,"<note n=\"96\">
  */
	const parser = Sax.parser(true);
	indef=false;
	parser.ontext = function (t) {
		if (capturing || indef) {
			captured+=t;
		} else {
			if (captured) emitstandoff();
			text+=t;	
			offset+=t.length;
		}
	};
	parser.onopentag = function (tag) {
		tagstack.push(tag);
	  handler=handlers[tag.name];
	  if (handler) {
	  	handler(tag);
	  } else{
	  	defaulthandler(tag);
	  }
	};
	parser.onclosetag = function (tagname) {
		const tag=tagstack.pop();
	  if (handler) {
	  	handler(tag,true);
	  } else{
	  	defaulthandler(tag,true);
	  }
	};
	parser.write(content);
}

lst.forEach(processfile);
emitstandoff();
emittaisho();
kepan=kepan.concat(subkepan);
//removeextrakepan();
fs.writeFileSync("mpps_taisho.js","module.exports="+JSON.stringify(taishotext,""," "),"utf8");
fs.writeFileSync("mpps_standoffs.js","module.exports="+JSON.stringify(standoffs,""," "),"utf8");
fs.writeFileSync("mpps_kepan.txt",kepan.join("\n"),"utf8");