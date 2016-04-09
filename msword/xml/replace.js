//node replace.js

var fs=require("fs");
var lst=fs.readFileSync("files.lst","utf8").split(/\r?\n/);

lst.map(function(fn){
	if (fs.existsSync(fn)) {
		console.log("converting",fn);
	}
})