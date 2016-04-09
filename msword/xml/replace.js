//node replace.js

var fs=require("fs");
var lst=fs.readFileSync("files.lst","utf8").split(/\r?\n/);

//s.replace(/<(H[01234567890]{1,2})>([^<（]*)/g,"<\1>\2</\1>");
/*
<b><H5>不淨觀
不淨觀</b><note n=“80“/><b>思惟</b>

convert to

<H5>不淨觀</H5>
<b>不淨觀<note n=“80“/>思惟</b>

*/

lst.map(function(fn){
	if (fs.existsSync(fn)) {
		console.log("converting",fn);
	}
})