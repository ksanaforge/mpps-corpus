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
var kepan=[],subtreecount=0;
var kepanmerge=require("./kepanmerge");
var treename=require("./treename");
var checkContent=function(fn,content){
	var notallow=["^","{","}","~","`"];
	notallow.map(function(pat){
		if (content.indexOf(pat)>-1)console.log(fn+" cannot have "+pat);
	})
}
var jinpart=[],lunpart=[],ndefpart=[];
var subkepan=[],kepan=[];


var addKepanSubtree=function(jinline,lunline){
	if (!subkepan.length)return;
	kepan=kepan.concat(subkepan);
	subkepan=[];
}
var processkepanline=function(line,jun,part) {
	var jinline=jin.length+jinpart.length;
	var lunline=lun.length+lunpart.length
	var isKai=false;
	var isnewtree=false;
	isKai =(line.indexOf(' m="J"')>-1||line.indexOf(' m="S"')>-1) ;

	line=line.replace(/ m="J"/,"").replace(/ m="S"/,"");
	line=line.replace(/ start="1"/,function(){
		addKepanSubtree(jinline);
		isnewtree=true;
		return "";
	});
	
	if (isnewtree) {
		var kid=(subtreecount+1)+".0";//same as first child
		kepan.push([0,treename[subtreecount],kid,isKai?"1":""]);
		subtreecount++;
	}
	line=line.replace(/<H(\d+)>(.+?)<\/H\d+>/,function(m,d,head,idx){
		var kid=subtreecount+"."+subkepan.length;
		subkepan.push([parseInt(d),head,kid,isKai?"1":""]);
		return "%"+kid+" "+head;
	});
	return line; 
}
var processfile=function(fn){
	var juan=parseInt(fn.substr(sourcepath));
	group=0;
	var content=fs.readFileSync(sourcepath+fn,"utf8");

	checkContent(fn,content);
  content=content.replace(/<note n="(\d+)">.*?<\/note>/g,function(m,m1){
			return "#"+juan+"."+m1;
	})


	var lines=content.split(/\r?\n/);
	var sharekepan=false;
	if (prevout) out=prevout; else out=lunpart;//start from lun

	for (var i=2;i<lines.length-1;i++) { //omit first 2 line and last line
		var line=lines[i],o;
		if (line.indexOf("<lun")>-1) {
			out=lunpart;
			o='^'+juan+'.'+group;
			out.push(o);
		} else if (line.indexOf("<ndef")>-1) {
			if (out!=ndefpart) prevout=out;
			out=ndefpart;
			line=line.replace('<ndef n="','<ndef n="'+juan+".");
		} else if (line.indexOf("<jin")>-1) {
			out=jinpart;
			group++;
			o='^'+juan+'.'+group
			out.push(o);
		} else if (line.indexOf("<H")>-1) {
			if (line.indexOf('m="S"')>-1) {
				sharekepan=true; //put to JIN instead of jun
			}
			line=processkepanline(line,juan,out);
		}

		if (line.trim()) {
			if (sharekepan) { //kepan just before JIN marker, which should be part of jin
				if (out==lunpart) jinpart.push(line);
				else out.push(line);
			} else {
				out.push(line);	
			}
		}
		sharekepan=false;
	}

	//process part of this file
	//jinkepan=jinkepan.concat(extractKepan(jinpart.join("\n")," (卷"+juan+")"));
	//lunkepan=lunkepan.concat(extractKepan(lunpart.join("\n")," (卷"+juan+")"));

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
  return str.replace(/<taisho n="(.*?)"><\/taisho>/g,function(m,m1){
		return "@t"+m1.replace(".","p");  //大正藏聯結
  })
  .replace(/<note_mpps ref="(.*?)"><\/note_mpps>/g,function(m,m1){
		return "@y"+m1.replace("#","p"); //導師大智度論筆記
		//y_A036p69
  })
  .replace(/<note_taisho vol="(.*?)" pg="(.*?)" n="(.*?)"><\/note_taisho>/g,function(m,vol,pg,n){
  	//taisho apparatus
  	return "@t"+vol+"p"+pg+n;
  })
  .replace(/<note_taisho vol="(.*?)" pg="(.*?)"><\/note_taisho>/g,function(m,vol,pg){
  	//taisho apparatus
  	pg=pg.replace(/[， ]/g,"");
  	if (pg.indexOf("-")>-1) { //has range
  		var m,r=pg.split("-");
  		var part1="@t"+vol+"p"+r[0],part2="@t"+vol+"p";

  		if (m=r[1].match(/(\d+[a-c]\d+)/)) { //cross page
  			part2+=m[1];
  		} else if (m=r[1].match(/[a-c]\d+/)){ //cross column
  			var p=parseInt(r[0])
  			part2+=p+m[1];
  		} else {//same column
  			var p=r[0].match(/(\d+[a-c])/);
  			if (!p) {
  				console.log(pg)
  			}
  			part2+=pg[1]+r[1];
  		}
  		return part1+"-"+part2;
  	} else {
  		return "@t"+vol+"p"+pg;	
  	}
  })
}
var replaceEmptyLineAfterParagraph=function(str){
	return str.replace(/(\^[0-9.]+)\n\n+/g,function(m,m1){
		return m1+"\n";
	});
}
var replaceFont=function(str){
	str= str.replace(/<kai>/g,"{k").replace(/<\/kai>/g,"k}")
  .replace(/<b>/g,"{").replace(/<\/b>/g,"}")
  .replace(/<u>/g,"{u").replace(/<\/u>/g,"u}")
  .replace(/\{u\{/g,"{u").replace(/\}u\}/g,"u}")

  return str;
}

var replace=function(str){
return str.replace(/<pb n="(\d+)"><\/pb>/g,function(m,m1){
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
/*
<H2 m="S">（貳）佛答：「習應般若波羅蜜」的內涵</H2>
<H2 m="S">一、習應五眾空、十二入空、十八界空、四諦空、十二因緣空、一切法空，是名與般若相應</H2>
^36.10

change to

<H2 m="S">（貳）佛答：「習應般若波羅蜜」的內涵</H2>
<H2 m="S">一、習應五眾空、十二入空、十八界空、四諦空、十二因緣空、一切法空，是名與般若相應</H2>
^36.10

*/
var swapParagraphKepan=function(str){
	var lines=str.split("\n");
	for (var i=1;i<lines.length;i++) {
		var line=lines[i];
		if (line[0]!=="^") continue;
		var j=i-1;
		while (lines[j][0]=="%") {
			var t=lines[j];
			lines[j]=lines[i];
			lines[i]=t;
			j--;
		}
	}
	return lines.join("\n");
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
addKepanSubtree(100); //last 100 juan


jin=jin.join("\n");
jin=jin.replace(/<kai>/g,"").replace(/<\/kai>/g,"");//all jin is kai
jin=replace(jin);
jin=replaceRef(jin);
jin=replaceFont(jin);

jin=jin.replace(/\{/g,"").replace(/\}/g,"");
jin=jin.replace(/<\/b>(#\d+)<b>/g,function(m,m1){return m1});
jin=jin.replace(/<jin><\/jin>/g,"");
jin=replaceEmptyLineAfterParagraph(jin);
jin=swapParagraphKepan(jin);


lun=replace(lun.join("\n"));
lun=replaceRef(lun);
lun=replaceFont(lun);
lun=lun.replace(/<lun><\/lun>/g,"");
lun=replaceEmptyLineAfterParagraph(lun);
lun=swapParagraphKepan(lun);

var alltext=all.join("\n")
alltext=replace(alltext)
alltext=replaceRef(alltext)
alltext=replaceFont(alltext)
//alltext=alltext.replace(/<\/b>(#\d+)<b>/g,function(m,m1){return m1});
alltext=replaceEmptyLineAfterParagraph(alltext);

ndef=ndef.join("\n");
ndef=replaceRef(ndef);
ndef=replaceFont(ndef);
ndef=ndef.replace(/<ndef n="(.*?)">.+?<\/ndef>/g,function(m,m1){
	return "#"+m1;
})

checkpart(jin,lun);

fs.writeFileSync("jin.txt",jin,"utf8");
fs.writeFileSync("lun.txt",lun,"utf8");
fs.writeFileSync("ndef.txt",ndef,"utf8");
fs.writeFileSync("all.txt",alltext,"utf8")
//fs.writeFileSync("jin_kepan.txt",jinkepan.join("\n"),"utf8");
//fs.writeFileSync("lun_kepan.txt",lunkepan.join("\n"),"utf8");
var out=kepan.map(function(k){return k.join("\t")});
fs.writeFileSync("kepan_nomatch.txt",out.join("\n"),"utf8");

kepan2=kepanmerge(kepan);
kepan2=kepan2.map(function(k){return k.join("\t")});
fs.writeFileSync("kepan.txt",kepan2.join("\n"),"utf8");

