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
const groupshift=10000; //assuming items in group less than 10000
const parseRange=function(str,line){
	const r=str.split("~");
	if (r.length>2) {
		throw "wrong range "+line
	}
	return r[0]+ (r[1]?"~"+r[1]:"");
}
const toInt=function(s){
	const p=s.split(".");
	return parseInt(p[0],10)*groupshift+parseInt(p[1]);

}
const expandRange=function(r){
	const i1=toInt(r[0]);
	const out=[];

	const i2=r[1].indexOf(".")>0?toInt(r[1]): (
		Math.floor(i1/groupshift)*groupshift+parseInt(r[1],10)
	);
	for (var i=i1;i<=i2;i++) {
		out.push(i);
	}
	return out;
}
const toRange=function(s,key,printgap) {
	var values=s.split(";");
	var nums=[]; 
	for (var i=0;i<values.length;i++){
		const v=values[i];
		if (v.indexOf("~")>-1){
			nums=nums.concat(expandRange(v.split("~")));
		} else {
			const n=toInt(v);
			if (isNaN(n)) {
				console.log("wrong number",v)
			}
			nums.push(toInt(v));
		}
	};
	nums.sort().filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
  });

	var gap=0;
	for (var i=1;i<nums.length;i++) {
		const diff=nums[i]-nums[i-1];
		if (diff!==1 && diff<groupshift/2) {
			gap++;
		}
	}

	if (gap &&printgap) console.log(key," gap in "+s);
	if (nums.length>10) {
		//console.log(key,nums.length)
	}
	return nums;
}
const packone=function(n){
	return Math.floor(n/groupshift)+"."+(n%groupshift);
}
const pack=function(nums){//pack nums to a short string notation
	var prevgroup=0;
	var segments=[], start;
	const emitgroup=function(end){
		segments.push(prevgroup+"."+start+ ((end>start)?"~"+end:""));
	}
	for (var i=0;i<nums.length;i++) {
		const group=Math.floor(nums[i]/groupshift);
		if (prevgroup!==group) {
			if(prevgroup>0)emitgroup(nums[i-1]%groupshift);
			start=nums[i]%groupshift;
		} else {
			if (i&&nums[i]-nums[i-1]!=1) {
				emitgroup(nums[i-1]%groupshift);
				start=nums[i]%groupshift;
			}
		}

		prevgroup=group;
	}
	emitgroup(nums[nums.length-1]%groupshift);
	return segments.join(";");
}
/* the kepan has no correspondance
   connect with paragraph
*/
const kepanToPara={};
const kepan2para=function(line){
	const parts=line.split(/[=-]/);
	var kepan,target;
	if (parts[1][0]=="^") { //connect to jin
		kepan=toRange(parts[0])
		target='J'+parts[1].substr(1);
	} else {
		kepan=toRange(parts[1]);
		target='L'+parts[0].substr(1);
	}

	for (var i=0;i<kepan.length;i++) {
		kepanToPara[packone(kepan[i])]=target;
	}
}
const processline=function(line,idx){
	if (line.indexOf("^")>-1) {
		kepan2para(line);
		return;
	}
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
	var hassegments={};
	for (var i in kepan) {
		if (kepan[i].indexOf(";")>-1) hassegments[i]=true;
		kepan[i]=toRange(kepan[i]);
	}

	for (var i in kepan) {
		if (hassegments[i]){
			const segments=kepan[i];
			for (var j=0;j<segments.length;j++) {
				const target=packone(segments[j]);
				if (target=="NaN.NaN") debugger;
				if (!kepan[target]) {
					//if (target=="89.108") debugger
					kepan[target]=toRange(i);
				} else {
					//multi to one
					//console.log('from',i,'to',target)
					kepan[target].push(toRange(i));
				}
			}
		} else {
			
			for (var j=0;j<kepan[i].length;j++) {
				const target=packone(kepan[i][j]);
				if (target==i) continue; //prevent self referencing 89.133=89.37~192

				if (target=="NaN.NaN") debugger;
				if (!kepan[target]) {
					kepan[target]=toRange(i);
				} else {
					kepan[target].push(toRange(i));
				}

			}
		}
	}

	//phase 2 
	//debugger;
	for (var i in kepan) {
		kepan[i]=pack(kepan[i]);
	}
}
/*
const listOrphan=function(){
	var nums=[];
	for (var i in kepan) {
		const k=toInt(i);
		if (isNaN(k)) {
			console.log("wrong ",i)
		}
		if (!kepan[i]) {
			console.log("empty",kepan[i],i)
		}
		nums.push( toInt(i) )
		nums=nums.concat(toRange(kepan[i],i));
	}
	nums.sort();

	var prevgroup=0;
	for (var i=0;i<nums.length;i++) {
		const group=Math.floor(nums[i]/groupshift);
		if (prevgroup!==group) {
			
		} else {
			if (i&&nums[i]-nums[i-1]!=1) {
				diff=nums[i]-nums[i-1];
				for (var j=1;j<diff;j++) {
					console.log(packone(nums[i-1]+j))	
				}
			}
		}
		prevgroup=group;
	}
}
*/
//console.log(pack([10001,10002,10003,20005,20006,20007,20008,30010,40050,40052,40053]));
//1.1~3;2.5~8;3.10;4.50;4.52~53

f1.map(processline);
f2.map(processline);

//listOrphan();
finalize();
console.log("done")
fs.writeFileSync("kepan-map.json",JSON.stringify(kepan,""," "),"utf8");
fs.writeFileSync("kepan-map-para.json",JSON.stringify(kepanToPara,""," "),"utf8");