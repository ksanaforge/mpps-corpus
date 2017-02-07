const {openCorpus}=require("ksana-corpus");
const mpps_taisho=require("./mpps_taisho");
const diff=require("diff");
const fs=require("fs")
openCorpus("taisho",function(err,cor){
	fetch(cor);
});
var suspect=[];
const maxcount=255;
const compressdiff=function(D,pb){
	var out=[],exceed=0;
	for (var i=0;i<D.length;i++) {
		const d=D[i];
		if (d.added || d.removed) {
			if (d.count>maxcount) {
				if (exceed==0) {
					console.log('exceed maxcount',pb,d.count);
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
const compare=function(allpb,text1,text2){
	var out=[];
	for (var i=0;i<text1.length;i++) {
		const t1=text1[i]//.replace(/\n/g,"");
		const t2=text2[i]//.replace(/\n/g,"");
		const d=diff.diffChars(t1,t2);

		out.push([allpb[i],compressdiff(d,allpb[i])]);
	}
	fs.writeFileSync('mpps_diff.js',JSON.stringify(out),"");
	console.log("DONE")
}
const fetch=function(cor) {
	const allpb=[],text1=[];
	const count= mpps_taisho.length;
	console.log("fetch count",mpps_taisho.length)
	for (var i=0;i<count;i++) {
		allpb.push(mpps_taisho[i][0].replace(".","p")+"0100-2931");
		text1.push(mpps_taisho[i][1]);
	}
	console.time("fetch")
	cor.getText(allpb,function(out){

		for (var i=0;i<out.length;i++){
			out[i]=out[i].join("\n");
		}
		console.timeEnd("fetch")
		compare(allpb,text1,out)
	});

}