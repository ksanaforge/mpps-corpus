var createCorpus=null
try {
	createCorpus=require("ksana-corpus-builder").createCorpus;
} catch(e){
	createCorpus=require("ksana-corpus-lib").createCorpus;
}

const fs=require("fs");
const sourcepath="xml/";
var files=fs.readFileSync(sourcepath+"filelist.lst","utf8").split(/\r?\n/);
//for (var i=0;i<42;i++) files.shift();
//files.length=1;
//files.length=3

const bookStart=function(){
//	noteReset.call(this);
}
const bookEnd=function(){
}

const body=function(tag,closing){

}

const fileStart=function(fn,i){
	const at=fn.lastIndexOf("/");
	console.log(fn)
}

var options={name:"mpps",inputFormat:"xhtml",
bits:[2,12,5,8],title:"大智度論講義",
maxTextStackDepth:3,
footnotes:require("./xml/footnotes.json"),
articleFields:["head","footnote","a@mpps","rend","origin"],
preload:["a"],//global anchor
rendClass:["kai","b","jin","j"], //<kai> will transform to <span class="kai">
removePunc:false,
articleAsGroup:true,
extrasize:1024*1024*5, //for external def
subtoc:"H0"}; 
var corpus=createCorpus(options);

//const {kai,b,pb}=require("./corpustag/format");
//const {note,ptr,ref,noteReset,notefinalize}=require("./corpustag/note");

const finalize=function(){
}
corpus.setHandlers(
	//open tag handlers
	{}, 
	//end tag handlers
	{}, 
	//other handlers
	{bookStart,bookEnd,fileStart,finalize}  
);

files.forEach(fn=>corpus.addFile(sourcepath+fn));

corpus.writeKDB("mpps.cor",function(byteswritten){
	console.log(byteswritten,"bytes written")
});

console.log(corpus.totalPosting,corpus.tPos);