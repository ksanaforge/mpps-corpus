/* combine 100 juan into 3 files, jin, luan and ndef */

/*

note:   #\d+\.\d+   #juan.seq


*/
var sourcepath="genxml/";
var lst='genxml/mpps.lst';
var fs=require("fs");
var lst=fs.readFileSync(lst,"utf8").split(/\r?\n/);
var jin=[],lun=[],ndef=[];
var out=lun,prevout;
var jinkepan=[],lunkepan=[];
var kepan=[];

var checkContent=function(fn,content){
	var notallow=["^","{","}","~","`"];
	notallow.map(function(pat){
		if (content.indexOf(pat)>-1)console.log(fn+" cannot have "+pat);
	})
}
var jinpart=[],lunpart=[],ndefpart=[];
var processfile=function(fn){
	var juan=parseInt(fn.substr(sourcepath));
	group=0;
	var content=fs.readFileSync(sourcepath+fn,"utf8");
	checkContent(fn,content);
	var lines=content.split(/\r?\n/);
	if (prevout) out=prevout; else out=lunpart;//start from lun

	for (var i=2;i<lines.length-1;i++) { //omit first 2 line and last line
		var line=lines[i];
		if (line.indexOf("<lun")>-1) {
			out=lunpart;
			out.push('^'+juan+'.'+group);
		} else if (line.indexOf("<ndef")>-1) {
			if (out!=ndefpart) prevout=out;
			out=ndefpart;
			line=line.replace('<ndef n="','<ndef n="'+juan+".");
		} else if (line.indexOf("<jin")>-1) {
			out=jinpart;
			group++;
			out.push('^'+juan+'.'+group);
		}

		if (line.indexOf('repeat="true"')==-1) { //ignore repeated kepan
			line=line.replace(/<note n="(\d+)"\/>/g,function(m,m1){
				return "#"+juan+"."+m1;
			})
			if (line.trim()) out.push(line);	
		}
	}

	//process part of this file
	//jinkepan=jinkepan.concat(extractKepan(jinpart.join("\n")," (卷"+juan+")"));
	//lunkepan=lunkepan.concat(extractKepan(lunpart.join("\n")," (卷"+juan+")"));
	kepan=kepan.concat(extractKepan(content," (卷"+juan+")"));

	if (juan==14) debugger;
	jin=jin.concat(jinpart);
	lun=lun.concat(lunpart);
	ndef=ndef.concat(ndefpart);
	if (prevout==jinpart) {
		prevout=jinpart=[];
		lunpart=[];
	} else if(prevout==lunpart) {
		jinpart=[];
		prevout=lunpart=[];
	} else {
		lunpart=[],jinpart=[];
	}
	ndefpart=[];
}

/* TODO Error parsing
（一）修多羅（印順法師，《大智度論筆記》［F029］p.360，［I042］p.449）
  to 
（一）修多羅@yF029］p.360，［I042p449
 in juan 33
*/
var replaceRef=function(str){
	// @[_a-zA-z0-9\-]
  return str.replace(/<taisho n="(.*?)"\/>/g,function(m,m1){
		return "@t"+m1.replace(".","p");  //大正藏聯結
  })
  .replace(/<note_mpps ref="(.*?)"\/>/g,function(m,m1){
		return "@y"+m1.replace("#","p"); //導師大智度論筆記
		//y_A036p69
  })
  .replace(/<note_taisho vol="(.*?)" pg="(.*?)" n="(.*?)"\/>/g,function(m,vol,pg,n){
  	//taisho apparatus
  	return "@t"+vol+"p"+pg+n;
  })
  .replace(/<note_taisho vol="(.*?)" pg="(.*?)"\/>/g,function(m,vol,pg){
  	//taisho apparatus
  	return "@t"+vol+"p"+pg;
  })
}
var replaceFont=function(str){
	str= str.replace(/<kai>/g,"{k").replace(/<\/kai>/g,"k}")
  .replace(/<b>/g,"{").replace(/<\/b>/g,"}")
  .replace(/<u>/g,"{u").replace(/<\/u>/g,"u}")
  .replace(/{u{/g,"{u").replace(/}u}/g,"u}")

  return str;
}
var replaceKepan=function(str){
  return str.replace(/<h(\d+) t="(.*?)">(.*?)<\/h\d+>/g,function(m,depth,m1,m2){
  	return "%"+depth+" "+m1+m2
  })
  .replace(/<h(\d+)>(.*?)<\/h\d+>/g,function(m,depth,m2){
  	return "%"+depth+" "+m2; //without t
  })  
}
var replace=function(str){
return str.replace(/<pb n="(\d+)"\/>/g,function(m,m1){
		return "~"+m1;
  })
	.replace(/%(\d+) ~(\d+)/g,function(m,depth,pb){
		return "~"+pb+"%"+depth+" "; //swap pb and depth , pb must before kepan
	})  
	.replace(/~(\d+)%/g,function(m,pb){
		return "~"+pb+"\n%";  //pb has own line if followed by kepan
	})
  .replace(/<body>/g,"")
}
var extractKepan=function(content,suffix){
	var out=[];
  var newformat=replaceRef(replaceKepan(content))
  .replace(/<pb .*?>/g,"").replace(/@.[A-Za-z0-9\-]+/g,"")
  .replace(/#[0-9.]+/g,"")
	newformat.replace(/%(.*)/g,function(m,m1){
		out.push(m1+suffix);
	});
	return out;
}

var checkpart=function(jin,lun){
	var jinpart=[],lunpart=[];
	jin.replace(/\^([0-9.]+)/g,function(m,m1){jinpart.push(m1)});
	lun.replace(/\^([0-9.]+)/g,function(m,m1){lunpart.push(m1)});
	jinpart=jinpart.join("\n");
	lunpart=lunpart.join("\n");
	if (jinpart!==lunpart) {
		console.log("jin and lun not aligned, see jin_part.txt and lun_part.txt");
		fs.writeFileSync("jin_part.txt",jinpart,"utf8");
		fs.writeFileSync("lun_part.txt",lunpart,"utf8");
	}
}
lst.map(processfile);
jin=jin.join("\n");
jin=jin.replace(/<kai>/g,"").replace(/<\/kai>/g,"");//all jin is kai
jin=replace(jin);
jin=replaceKepan(jin);
jin=replaceRef(jin);
jin=replaceFont(jin);
jin=jin.replace(/<jin>經<\/jin>/g,"");
jin=jin.replace(/\{/g,"").replace(/\}/g,"");
jin=jin.replace(/<\/b>(#\d+)<b>/g,function(m,m1){return m1});

//var jinkepan=extractKepan(jin);

lun=replace(lun.join("\n"));
lun=replaceKepan(lun);
lun=replaceRef(lun);
lun=replaceFont(lun);
lun=lun.replace(/<lun>論<\/lun>/g,"");

//var lunkepan=extractKepan(lun);

ndef=ndef.join("\n");
ndef=replaceRef(ndef);
ndef=replaceFont(ndef);
ndef=ndef.replace(/<ndef n="(.*?)"\/>/g,function(m,m1){
	return "#"+m1;
})

checkpart(jin,lun);

fs.writeFileSync("jin.txt",jin,"utf8");
fs.writeFileSync("lun.txt",lun,"utf8");
fs.writeFileSync("ndef.txt",ndef,"utf8");

//fs.writeFileSync("jin_kepan.txt",jinkepan.join("\n"),"utf8");
//fs.writeFileSync("lun_kepan.txt",lunkepan.join("\n"),"utf8");
fs.writeFileSync("kepan.txt",kepan.join("\n"),"utf8");

