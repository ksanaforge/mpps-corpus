/*generate toc */
var fs=require("fs");
var files=fs.readFileSync("./xml/files.lst","utf8").split(/\r?\n/);
var sourcepath="./genxml/";
files.shift();//ignore 000
var processfile=function(fn){
	var content=fs.readFileSync(sourcepath+fn,"utf8");

	content.replace(/<h(\d+) t="(.+?)">(.+?)<\/h/g,function(m,d,t,text){
		console.log(fn.substr(0,3)+"\t"+d+"\t"+t+text);
	});

}
files.map(processfile)