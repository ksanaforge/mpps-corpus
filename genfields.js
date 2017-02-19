/*	generate external kdb fields from mpps_standoffs_converted.js */
const standoffs=require("./mpps_standoffs_converted");
const {openCorpus,bsearch}=require("ksana-corpus");
var cor;
var fascicle=1,para=0;//current fascile
var H=[],notes=[],links=[],wrongpos=[],ndefs={},paragraphs=[];
const endofmpps="25p0756c19";
var prevpage=0,pagerange,pagetext=null,linebreaks;
const fs=require("fs");
/*group by article */


const calKPos=function(realpos){
	const line=bsearch(linebreaks,realpos,true)-1;
	const ch=realpos-linebreaks[line];
	if (!pagetext[line]) {
		//console.log("error realpos",realpos);
		return 0;
	}
	const kch=cor.kcount(  pagetext[line].substr(0,ch));
	return cor.makeKPos([pagerange.startarr[0],pagerange.startarr[1],line,kch]);
}
const processndef=function(ndef){
	var s=ndef.replace(/<note_taisho vol="(\d+)" pg="p?\.?([ 、，及以下；\da-z\-]+?)"><\/note_taisho>/g,function(m,v,pg){
		pg=pg.replace(/以下/,"").replace(/ /g,"");
		if (pg.indexOf("；")>-1) {
			const parts=pg.split("；");
			return parts.map(p=>"@t"+v+"p"+p).join(" ");
		} else {
			pg=pg.replace(/以下/,"");
			return "@t"+v+"p"+pg.replace(/[，及]/,"-");	
		}
	});	

//cbeta校勘欄
	s=s.replace(/<note_taisho vol="(\d+)" pg="(\d+d+)" n="(.*?)"><\/note_taisho>/g,function(m,v,pg,n){
		//some with extra d
		return "@t"+v+"p"+pg.replace("dd","d")+n;
	});	

	s=s.replace(/<note_mpps ref="(.+?)"><\/note_mpps>/g,function(m,mpps){
		return "@y"+mpps; //印順導師大智度論筆記
	});

	s=s.replace(/<kai>/g,"{k").replace(/<\/kai>/g,"k}");
	s=s.replace(/<b>/g,"{").replace(/<\/b>/g,"}");

	s=s.replace(/《大智度論》講義（第\d+期）/g,"");
	s=s.replace(/第[一二三四五六七]冊：《大智度論》卷\d+/g,"");
	s=s.replace(/<\/body><\/html>/g,"");
	s=s.replace(/<link rel="stylesheet" type="text\/css" href="default_html.css"\/>/,"");
	s=s.replace(/\n\n---------------/g,"");
	return s;
}
const ndefblocks=function(str){
	const items=str.split(/<ndef n="(\d+)"><a id=".+?" href="#.+?">\[\d+\]<\/a><\/ndef>/);
	items.shift();
	for (var i=0;i<items.length/2;i++) {
		const id=items[i*2];
		const content=items[i*2+1];
		ndefs[fascicle+"."+id]=processndef(content);
	}
	fascicle++;
	para=0;
}

const emit=function(arr,realpos,a1,a2){
	const kpos=calKPos(realpos);
	if (kpos) {
		arr.push(cor.stringify(kpos)+"\t"+a1+"\t"+a2);
	} else {
		wrongpos.push([realpos,prevpage,a1,a2]);
		//console.log("wrong pos",a1,a2,realpos,prevpage);
	}
}
const processtag=function(standoff){
	pagerange=cor.parseRange(standoff[0].replace(".","p")+"0100-2931");
	
	if (prevpage!==standoff[0]) {
		pagetext=cor.getText(pagerange.range);
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
	if (realpos<0) realpos=-realpos;//closeest guess
	if (standoff[2].substr(0,5)=="<ndef") {
		ndefblocks(standoff[2]);
		return
	}
	standoff[2].replace(/<note_taisho vol="(\d+)" pg="([a-d\d\-]+)"><\/note_taisho>/g,function(m,v,pg){
		emit(links,realpos,"taisho",v+"p"+pg);
	});

	standoff[2].replace(/<note_mpps ref="(.+?)"><\/note_mpps>/g,function(m,mpps){
		emit(links,realpos,"mpps",mpps);
	});

	standoff[2].replace(/<H(\d+).*?>(.*?)<\/H\d+>/,function(m,depth,head){
		const id=m.match(/id="([\d\.]+)"/)[1];
		kepanpos[id]=calKPos(realpos);
		kepanid.push(id);
		emit(H,realpos,depth+"\t"+head,id);
	})

	standoff[2].replace(/<jin>/,function(){
		para++;
		const jinid=fascicle+"."+para
		jinparapos[jinid]=calKPos(realpos);
		emit(paragraphs,realpos,"jin",jinid);
	});
	standoff[2].replace(/<lun>/,function(){
		const lunid=fascicle+"."+para;
		lunparapos[lunid]=calKPos(realpos);
		emit(paragraphs,realpos,"lun",lunid)
	});

	standoff[2].replace(/<note n="(\d+)"\/>/,function(m,id){
		emit(notes,realpos,fascicle+"."+id,""); // attachNoteWithNdef will fill it
	})


/*
 //講義內的大正原書頁碼
	standoff[2].replace(/<note_taisho vol="(\d+)" pg="(.*?)" n="(.*?)"><\/note_taisho>/g,function(m,v,pg,n){
		console.log("taisho2",v,pg,n)
	})*/

}

const attachNoteWithNdef=function(){
	for (var i=0;i<notes.length;i++){
		const id=notes[i].split("\t")[1];
		if (!ndefs[id]) {
			console.log("note id not found",id);
		}
		notes[i]+=ndefs[id];
		delete ndefs[id];
	}
}
var jinparapos={}, lunparapos={}; //ksana position given jin or lun paragraph id (juan.seq)
var kepanpos={}; //ksanaposition given kepan id (nkepan.seq)
var kepanid=[];

//kepan target is kranges.
//when kepan is click , highlight the text in the first range (jump to begining), 
//click second time , highlight the second range,
//UI should notify user the kepan has multiple range
const getKepanStartEnd=function(id){ //given an kepan id return its start and end kpos
	const at=kepanid.indexOf(id);
	if (at==-1) {
		console.log("wrong id",id);
		debugger;
		//throw "wrong id "+id;
	}
	const endpos= (at==kepanid.length-1) ?endofmpps:kepanpos[kepanid[at+1]]
	return [kepanpos[id], endpos];
}
const breakKepanRange=function(r){
	const parts=r.split("~");
	if (parts.length==1) {
		return parts[0];
	}
	const start=parts[0];
	const end=start.match(/(.+)\./)[1] + "."+parts[1];
	return [start,end];
}
const kepanrange2krange=function(str){
//return krange , start=start of first kepan, end=end of last kepan
	const ranges=str.split(";");

	const out=[];
	for (var i=0;i<ranges.length;i++) {
		const range=ranges[i];
		const r=breakKepanRange(range);
		var krange;
		if (typeof r=="string") {
			const se=getKepanStartEnd(r);
			krange=cor.makeRange( se[0],se[0]) ;
		} else { //has ~
			const se1=getKepanStartEnd(r[0])
			//const se2=getKepanStartEnd(r[1])
			krange=cor.makeRange( se1[0], se1[0]) ;
		}
		out.push(cor.stringify(krange));
	}
	return out.join(";");
}
const bindJinLunKepan=function(heads){
	console.log("binding jin lun kepan")
	const kepanMap=require("./kepan-map.json");
	const kepanMapPara=require("./kepan-map-para.json");

	for (var i=0;i<heads.length;i++){
		const head=heads[i].split("\t");
		const headkepanid=head[3];
		const target=kepanMap[headkepanid];
		if (target) {
			head[4]="("+head[3]+"=>"+target+")";
			head[3]=kepanrange2krange(target);
		} else {
			const para=kepanMapPara[headkepanid];
			if (para) {
				const parapos=(para[0]=='J')?jinparapos[para.substr(1)]:lunparapos[para.substr(1)];
				if (!parapos) {
					console.log("error parapos of",para,"for kepan",headkepanid);
				}
				head[4]="("+head[3]+"=>"+para+")";
				head[3]=cor.stringify(parapos);
			}
		}
		heads[i]=head.join("\t");
	}
	
	return heads;
}
openCorpus("taisho",function(err,_cor){
	cor=_cor;
	const alltext=cor.parseRange('25p57a0100-756c2919'); //range of MPPS
	cor.getText(alltext.range,function(text){
		console.log("text fetched");
		standoffs.forEach(processtag);	

		if (fascicle!==101) { //after last ndef it will become 101
			console.log("wrong fasicle",fascicle-1);
		}
		
		const kepans=bindJinLunKepan(H);
		kepans.unshift({type:"kepan",corpus:"taisho",first:"25p57c0805"});
		fs.writeFileSync("mpps_fields_head.json",JSON.stringify(kepans,""," "),"utf8");


		links.unshift({type:"link",corpus:"taisho",first:"25p57c0805"});
		fs.writeFileSync("mpps_fields_link.json",JSON.stringify(links,""," "),"utf8");

		attachNoteWithNdef();
		notes.unshift({type:"mppsnote",corpus:"taisho",first:"25p57c0805"});
		fs.writeFileSync("mpps_fields_note.json",JSON.stringify(notes,""," "),"utf8");

		paragraphs.unshift({type:"p",corpus:"taisho",first:"25p57c0805"});
		fs.writeFileSync("mpps_fields_p.json",JSON.stringify(paragraphs,""," "),"utf8");


		//fs.writeFileSync("ndef.json",JSON.stringify(ndefs,""," "),"utf8");

		fs.writeFileSync("mpps_fields_wrongpos.txt",wrongpos.join("\n"),"utf8");
		
		console.log("unconsumed ndef" ,Object.keys(ndefs).length," in mpps_fields_wrongndef.txt");
		fs.writeFileSync("mpps_fields_wrongndef.txt",JSON.stringify(ndefs,""," "),"utf8");
		console.log("done")		;
	});
});

