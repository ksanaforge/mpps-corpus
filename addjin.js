const addjin=function(content) {

	content=content.replace(/<kai><jin><\/jin>(.+?)<\/kai>n/g,function(m,m1){
		return "<jin>"+"</jin>"+m1;
	});


	content=content.replace(/<kai>(〔?)<jin><\/jin>([\s\S]*?)<\/kai>/g,function(m,m1,m2){
		return "<jin></jin>"+m1+m2;
	});

	//remove all kai setting between <jin> and <lun>
	var previdx=0;
	
	content=content.replace(/<jin><\/jin>([\s\S]*?)<lun><\/lun>/g,function(m,jinpart){
		return "<j>【經】"+jinpart.replace(/<\/?kai>/g,"").trim()+
		"</j>\n【論】";
	});

	return content;
}
module.exports=addjin;

	/*
	content=content.replace(/<kai><jin><\/jin>(.+?)<\/kai>n/g,function(m,m1){
		return "<jin>"+m1+"</jin>"
	});


	content=content.replace(/<kai>(〔?)<jin><\/jin>([\s\S]*?)<\/kai>/g,function(m,m1,m2){
		return "<j>【經】"+m1+m2+"</j>"
	});

	content=content.replace(/<jin>(.+?)<\/jin>/g,function(m,m1){
		return "<j>"+m1+"</j>";
	});


	//content=content.replace(/<kai><jin><\/jin><\/kai>/g,"<j>【經】");

	if (content.indexOf("<jin></jin>")>-1) {
		content=content.replace(/<jin><\/jin>/g,"<j>【經】");
		content=content.replace(/<lun><\/lun>/g,"</j>【論】");
	} else {
		content=content.replace(/<lun><\/lun>/g,"【論】");
	}

	//dirty hack
	if (content.indexOf("<j>【經】</j>")>-1) {
		content=content.replace(/<j>【經】<\/j>/g,"<j>【經】");
		content=content.replace(/\n【論】/g,"\n</j>【論】");
		//content=content.replace(/<\/j><\/j>【論】/g,"</j>【論】");
	}
	
	content=content.replace(/<\/j>(.*)\n<\/j>/g,function(m,m1){
		return "</j>"+m1+"\n"
	});

	content=content.replace(/<\/kai>(.*)\n<\/j>/g,function(m,m1){
		return "</kai>"+m1+"\n"
	});


	content=content.replace(/<\/j>\n(<.+?>)<\/j>/g,function(m,m1){
		return "</j>"+"\n"+m1
	});

	content=content.replace(/<\/kai>\n(<.+?>)<\/j>/g,function(m,m1){
		return "</kai>"+"\n"+m1
	});
	content=content.replace(/<\/kai>\n<\/j>【論】/g,"</kai>\n【論】");

	//content=content.replace(/<jin><\/jin>/g,"<jin>");
	//content=content.replace(/<lun><\/lun>/g,"</jin>");
	//content=content.replace(/<kai><jin>/g,"<jin>");
	//content=content.replace(/<\/kai>\n<\/jin>/g,"</jin>");
	*/