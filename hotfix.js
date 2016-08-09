var hotfixes={
	21:[
	['$（2）<h3 t="三、">四勝處</h3>','<h6 t="（2）">三、四勝處</h6>']
	]
}

var dohotfix=function(content,fn) {
	var prefix=parseInt(fn);
	var hotfix=hotfixes[prefix];
	if (!hotfix)return content;

	for (var i=0;i<hotfix.length;i++) {
		content=content.replace(hotfix[i][0],hotfix[i][1]);
	}
	return content;
}
var matchcount=function(line,pat){
	var m=0;
	line.replace(pat, function(){m++});
	return m;
}


var removeNopTagBefore=function(content){
	content=content.replace(/<B>/g,"<b>");
	content=content.replace(/<\/B>/g,"</b>");
	content=content.replace(/<b><\/b>/g,"");
	content=content.replace(/<u>\n<\/u>/g,"\n");
	return content;	
}

var removeNopTagAfter=function(content){
	content=content.replace(/<b><\/b>/g,"");
	content=content.replace(/<b><\/u><\/b>/g,"</u>");
	content=content.replace(/<u><\/u>/g,"");
	content=content.replace(/<u>\n<\/u>/g,"\n");
	return content;
}

var fix_head=function(content){
	return content.replace(/\n<\/h(\d+)>/g,function(m,m1){
		return '</h'+m1+">\n"; //move endtag at begining of line to previous end of line
	});
	//<b><h4 t="（三）">辨異同</h4>
  //<h5 t="1">法王與輪王同異</h5></b>
}

	//content=content.replace(/\$<h/g,"<h");
	//content=content.replace(/\$<pb/g,"<pb");

	//content=content.replace(/<kai>\$/g,"<kai>");
	
	//content=content.replace(/\$<h/g,"<h");
	//content=content.replace(/\$<pb/g,"<pb");
	//content=content.replace(/\$<\/b/g,"</b");
	//content=content.replace(/\$※/g,"※");
module.exports={removeNopTagBefore,removeNopTagAfter};
