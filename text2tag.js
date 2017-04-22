/* input,output :string 
change a text pattern to xml tag*/
var mpps_yinshun_note=function(content){
	content=content.replace(/（?印順法師，《?大智度論筆記》[〔［](.+?)[〕］]p\.?(\d+)；[〔［](.+?)[〕］]p\.(\d+)）?/g,function(m,bk1,pg1,bk2,pg2){
		return '<note_mpps ref="'+bk1+'#'+pg1+'"></note_mpps><note_mpps ref="'+bk2+'#'+pg2+'"></note_mpps>';
	});

	content=content.replace(/（?印?\n?順?\n?[法導]\n?師，?\n?《?大\n?智\n?度\n?論\n?筆\n?記》\n?[〔［]\n?(.+?)[〕］）]\n?，?\n?p\.?(\d+)）?/g,function(m,bk,pg){
		return '<note_mpps ref="'+bk+'#'+pg+'"></note_mpps>';
	});
	content=content.replace(/（?印\n?順\n?[導法]\n?師，\n?《?大\n?智\n?度\n?論\n?筆\n?記》\n?[〔［](.+?)[〕］）]\n?pp\.?(\d+)-\d+）?/g,function(m,bk,pg){
		return '<note_mpps ref="'+bk+'#'+pg+'"></note_mpps>';
	});

	content=content.replace(/（《大智度論筆記》[〔［]\n?(.+?)[〕］]\n?p\.(\d+)）?/g,function(m,bk,pg){
		return '<note_mpps ref="'+bk+'#'+pg+'"></note_mpps>';
	});	

	content=content.replace(/〔([A-Z]\d+)〕\n?p\.(\d+)[）；]/g,function(m,bk,pg){
		return '<note_mpps ref="'+bk+'#'+pg+'"></note_mpps>';
	});


	return content.replace(/（?[〔［]\n?([A-Z]\d+)[〕］]\n?p\.(\d+)）/g,function(m,bk,pg){
		return '<note_mpps ref="'+bk+'#'+pg+'"></note_mpps>';
	});
}

var taisho=function(content) {
	return content.replace(/（\n?大\n?正\n?(\d+)\n?，\n?([\dabcd\-]+)\n?，n\.(\d+)）/g,function(m,vol,pg,sutra){
		return '<note_taisho vol="'+vol+'" pg="'+pg+'" n="'+sutra+'"></note_taisho>';
	}).replace(/（\n?大\n?正\n?(\d+)\n?，\n?([\dabc\-]+)\n?[）\)]/g,function(m,vol,pg){
		return '<note_taisho vol="'+vol+'" pg="'+pg+'"></note_taisho>';
	}).replace(/<taisho n="[\dabc]+"\/>/g,function(m,m1){ //taisho page num
		return '<taisho n="'+m1+'"></taisho>';
	});
}

var see_previous_juan=function(content){
	content=content.replace(/（承上卷(\d+)）/g,function(m,juan){
		return '<note_juan n="'+juan+'"></note_juan>';
	}).replace(/（承上卷(\d+)〈(.+)〉）/g,function(m,juan,vagga){
		return '<note_juan n="'+juan+'" vagga="'+vagga+'"></note_juan>';
	}).replace(/（承上卷(\d+)～卷?(\d+)）/g,function(m,juan,j2){
		return '<note_juan n="'+juan+'" n2="'+j2+'"></note_juan>';
	}).replace(/（承上卷(\d+)〈(.+)〉～卷?(\d+)）/g,function(m,juan,vagga,j2){
		return '<note_juan n="'+juan+'" n2="'+j2+'" vagga="'+vagga+'"></note_juan>';
	}).replace(/（承上卷(\d+)（大正(\d+)，([0-9abc]+)-([0-9abc]+)））/g,function(m,juan,vol,r1,r2){
		return '<note_juan n="'+juan+'" taisho="'+vol+'" from="'+r1+'" to="'+r2+'"></note_juan>';
	});
	return content;	
}
//empty tag <pb/> will crash chrome 
var pb=function(content){
	return content.replace(/`(\d+)`/g,function(m,m1){
		return '<pb n="'+m1+'"></pb>';
	});
}

var kai=function(content){
	return content.replace(/\^([\s\S]+?)\^\^/g,function(m,m1){
		return "<kai>"+m1+"</kai>";
	});
}

/* assuming 論 is bold , because ndef might have 【論】, juan #85.70 */
var jinlun=function(content) {
	//jin and lun has it own line.
	//first 40 juan text might follow jin/lun marker
	return content.replace(/【<b>經<\/b>】/g,"<jin></jin>")
	//.replace(/【經】/g,"<jin>經</jin>")
	.replace(/【<b>論<\/b>】/g,"<lun></lun>")
	.replace(/【<b>論<\/b>(<note .*?>)】/g,function(m,note){ //juan 51 lun has note
		return "<lun></lun>"+note;
	})
	//.replace(/【論】/g,"<lun>論</lun>");
}
var markNote=function(content){
	return content.replace(/<note n="(\d+)"\/>/g,function(m,m1){
		return '<note n="'+m1+'"><a id="n'+m1+'" href="#d'+m1+'">['+m1+"]</a>"+'</note>';
	}).replace(/<ndef n="(\d+)"\/>/g,function(m,m1){
		return '<ndef n="'+m1+'"><a id="d'+m1+'" href="#n'+m1+'">['+m1+']</a></ndef>';
	});
}
var doAll=function(content) {
	content=jinlun(content);
	content=kai(content);
	content=pb(content);
	content=mpps_yinshun_note(content);
	content=taisho(content);
	content=markNote(content);
	return content;
}
module.exports={doAll,taisho,see_previous_juan,mpps_yinshun_note
	,pb,kai,jinlun};