/*	generate external kdb fields from mpps_standoffs_converted.js */
const standoffs=require("./mpps_standoffs_converted");
const {openCorpus,bsearch}=require("ksana-corpus");
var cor;
var output=[],prevpage=0,pagerange,pagetext=null,linebreaks;
const fs=require("fs");
/*group by article */
const calKPos=function(realpos){
	const line=bsearch(linebreaks,realpos,true)-1;
	const ch=realpos-linebreaks[line];
	if (!pagetext[line]) {
		console.log("error realpos",realpos);
		return 0;
	}
	const kch=cor.kcount(  pagetext[line].substr(0,ch));
	return cor.makeKPos([pagerange.startarr[0],pagerange.startarr[1],line,kch]);
}
const processtag=function(standoff){
	pagerange=cor.parseRange(standoff[0].replace(".","p")+"0100-2931");
	
	if (prevpage!==standoff[0]) {
		pagetext=cor.getText(pagerange.kRange);
		var len=0;
		linebreaks=pagetext.map(function(l){
			len+=l.length+1;
			return len;
		});
		linebreaks.unshift(0);
		prevpage=standoff[0];
	}
	if (!standoff[3]) return;
	realpos=standoff[3];
	if (realpos<0) realpos=-realpos;//closeest guest

	standoff[2].replace(/<H(\d+).*?>(.*?)<\/H\d>/,function(m,depth,head){
		const kpos=calKPos(realpos);
		if (kpos) {
			output.push(cor.stringify(kpos)+"\t"+depth+"\t"+head);
		} else {
			console.log("wrong pos",head,realpos,prevpage);
		}
	})
}

openCorpus("taisho",function(err,_cor){
	cor=_cor;
	const alltext=cor.parseRange('25p57a0100-756c2919'); //range of MPPS
	cor.getText(alltext.kRange,function(text){

		standoffs.forEach(processtag);	
		fs.writeFileSync("mpps_fields.js",'module.exports='+JSON.stringify(output,""," "),"utf8");
		
	});
});

