/* parse gprajna_kepan_mapping/jin-lun.txt and lun-jin.txt*/
/* create a mapping format for getfields.js */
/*output format
{
	"kepan_id":"start_kepan_id\tend_kepan_id"
}
*/

const fs=require("fs");
const f1=fs.readFileSync('gprajna_kepan_mapping/lun-jin.txt','utf8').split(/\r?\n/);
const f2=fs.readFileSync('gprajna_kepan_mapping/jin-lun.txt','utf8').split(/\r?\n/);
var kepan={};
const parseRange=function(str,line){
	const r=str.split("~");
	if (r.length>2) {
		throw "wrong range "+line
	}
	return r[0]+ (r[1]?"-"+r[1]:"");
}
const toInt=function(s){
	const p=s.split(".");
	return parseInt(p[0],10)*10000+parseInt(p[1]);

}
const expandRange=function(r){
	const i1=toInt(r[0]);
	const out=[];

	const i2=r[1].indexOf(".")>0?toInt(r[1]): (
		Math.floor(i1/10000)*10000+parseInt(r[1],10)
	);
	for (var i=i1;i<=i2;i++) {
		out.push(i);
	}
	return out;
}
const toRange=function(s,key) {
	var values=s.split(";");
	var nums=[]; 
	for (var i=0;i<values.length;i++){
		const v=values[i];
		if (v.indexOf("~")>-1){
			nums=nums.concat(expandRange(v.split("~")));
		} else {
			nums.push(toInt(v));
		}
	};
	nums.sort().filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
  });

	var gap=0;
	for (var i=1;i<nums.length;i++) {
		const diff=nums[i]-nums[i-1];
		if (diff!==1 && diff<5000) {
			gap++;
		}
	}

	if (gap) console.log(key," gap in "+s);

	return nums;
}
const processline=function(line,idx){
	if (line.indexOf("^")>-1)return;
	const parts=line.split(/[\-=]/);
	if (parts.length!==2) {
		console.log("error parsing line",idx+1,line);
		return;
	}
	const key=parts[0];
	if (kepan[key]) {
		kepan[key]+=";"+parts[1];
	} else {
		kepan[key]=parseRange(parts[1],idx+1);
	}
}
const finalize=function(){
	for (var i in kepan) {
		if (kepan[i].indexOf(";")>-1){
			kepan[i]=toRange(kepan[i],i);
		}
	}
}

f1.map(processline);
f2.map(processline);
finalize();
fs.writeFileSync("kepan-map.json",JSON.stringify(kepan,""," "),"utf8");