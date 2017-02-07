const {openCorpus,bsearch}=require("ksana-corpus");

const mpps_taisho=require("./mpps_taisho");
const diff=require("diff");
const fs=require("fs")
const mpps_standoffs=require("./mpps_standoffs");
openCorpus("taisho",function(err,cor){
	fetch(cor);
});
var suspect=[];
const maxcount=64;
const finddistance=function(D,pb){
	var out=[],exceed=0;
	for (var i=0;i<D.length;i++) {
		const d=D[i];
		if (d.added || d.removed) {
			if (d.count>maxcount) {
				if (exceed==0) {
					console.log('exceed maxcount',pb,d.count);
					console.log(d.value);
					exceed++;
				}
			}
			if (d.added) {
				out.push(-d.count);
			} else {
				out.push(-(d.count*256));
			}
		} else {
			out.push(d.count);
		}
	}
	return out;
}
const compressdiff=function(D,pb){
	var p1=0,p2=0,out1=[],out2=[];
	//if (pb=="25p59b0100-2931") debugger;
	for (var i=0;i<D.length;i++) {
		const d=D[i];
		if (d.added) {
			p1+=d.count;
		} else if (d.removed) {
			p2+=d.count;
		} else {
			out1.push(p1);
			out2.push(p2);
			p1+=d.value.length;
			p2+=d.value.length;
		}
	}
	out1.push(p1);
	out2.push(p2);

	return [out1,out2];
}

const compare=function(rawpb,text1,text2){
	var out={};
	for (var i=0;i<text1.length;i++) {
		const t1=text1[i];//.replace(/\n/g,"");
		const t2=text2[i];//.replace(/\n/g,"");
		const d=diff.diffChars(t1,t2);
		const pb=rawpb[i];
		out[pb]=compressdiff(d,pb);
	}
	
	return out;
	//fs.writeFileSync('mpps_diff.js',JSON.stringify(out),"");
	
}

const translate=function(t1pos,t2pos,pos){
	const at=bsearch(t1pos,pos,true)-1;
	const dist=pos-t1pos[at];
	const t2dist=t2pos[at+1]-t2pos[at];
	if (t2dist>dist) {
		return t2pos[at]+dist;
	} else {
		return -(t2pos[at]+dist);
	}
}

const convert=function(pbdiffs,standoffs){
	
	for (var i=0;i<standoffs.length;i++) {
		const pb=standoffs[i][0];
		const pos=standoffs[i][1];
		const diffs=pbdiffs[pb];

		standoffs[i].push(translate(diffs[0],diffs[1],pos));
	}
	return standoffs;
}
const check=function(rawpb,text1,text2,out){
	for (var i=0;i<out.length;i++) {
		const pb=out[i][0];
		const p1=out[i][1];
		const p2=out[i][2];
		const at=bsearch(rawpb,pb);
		const t1=text1[at],t2=text2[at];
		console.log(pb);
		console.log(p1,t1.substr(p1,10))
		console.log(p2,t2.substr(p2,10))
	}
	
}
const fetch=function(cor) {
	const allpb=[],text1=[],rawpb=[];
	const count= mpps_taisho.length;
	console.log("fetch count",mpps_taisho.length)
	for (var i=0;i<count;i++) {
		rawpb.push(mpps_taisho[i][0]);
		allpb.push(mpps_taisho[i][0].replace(".","p")+"0100-2931");
		text1.push(mpps_taisho[i][1]);
	}
	console.time("fetch")
	cor.getText(allpb,function(texts){

		for (var i=0;i<texts.length;i++){
			texts[i]=texts[i].join("\n");
		}
		console.timeEnd("fetch")
		const diffs=compare(rawpb,text1,texts);

		console.log("start convert");
		const new_standoffs=convert(diffs,mpps_standoffs);

		console.log("write to mpps_standoffs_converted")
		fs.writeFileSync("mpps_standoffs_converted.js",JSON.stringify(new_standoffs,""," "),"utf8");
		/*
		output=convert(diffs,[
			//["25.58a" ,43],
			["25.58a" ,202]
			]);
		check(rawpb,texts,text1,output);
		*/
	});

}