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
const on_H=function(tag,closing){
	if (closing) {
		captured+="</"+tag.name+">";
		capturing=false;
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
	a:on_H,ndef:on_ndef,
	taisho:on_taisho
}
const processfile=function(fn){
	console.log("processing",fn)
	const content = fs.readFileSync(sourcepath+fn,"utf8")
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
const removeextractkepan=function(){
	for (var i =0;i<taishotext.length;i++) {
		var s=taishotext[i][1];
		taishotext[i][1]=s.replace(/\$\$.*?\n/g,"");
	}
}
lst.forEach(processfile);
emittaisho();
removeextractkepan();
fs.writeFileSync("mpps_taisho.js","module.exports="+JSON.stringify(taishotext,""," "),"utf8");
fs.writeFileSync("mpps_standoffs.js","module.exports="+JSON.stringify(standoffs,""," "),"utf8");