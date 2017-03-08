/* extract table from ndef */
const fs=require("fs");
const ndef=fs.readFileSync("ndef.txt","utf8");
var previd,prev;
var tablecount=0;
const parseNdef=function(id,body){
	if (!body.match(/[└┌┴┬]/))return;
	tablecount++;
	const ref=[];
	const m=body.replace(/(@y[A-Z]+\d+p\d+)/g,function(m,m1){
		ref.push(m);
	});
	if (ref.length==0) {
		//console.log("NO @y",id)
	} else {
		console.log(id+"="+ref.join(","));
	}
	
}
ndef.replace(/(\#\d+\.\d+)/g,function(m,nid,idx){
	if (prev) {
		const body=ndef.substring(prev,idx);
		parseNdef(previd,body);
	}
	previd=nid;
	prev=idx+m.length;
})
console.log(tablecount)