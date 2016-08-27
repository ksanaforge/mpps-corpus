/*generate toc */
//separate jin and luan , two toc
var fs=require("fs");
var files=fs.readFileSync("./genxml/files.lst","utf8").split(/\r?\n/);
var sourcepath="./genxml/";
files.shift();//ignore 000
var prevdepth=0,ntree=0;
var processfile=function(fn){
	var content=fs.readFileSync(sourcepath+fn,"utf8");

	content.replace(/<H(\d+).*?>(.+?)<\/H/g,function(m,d,t,text){
		var warning=false;
		d=parseInt(d);
		if (d>prevdepth && d-prevdepth>1) {
			warning=true;
		}
		if (t.indexOf("壹、")>-1) ntree++
		tree="00"+ntree;
		tree=tree.substr(tree.length-3);
		console.log((warning?"!!":"")+tree+" "+fn.substr(0,3)+"\t"+d+"\t"+t+text);
		prevdepth=d;
	});

}
files.map(processfile)