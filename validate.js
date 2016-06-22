var validate=function(contents,fn,extraline) {
	var i,tagcount=0,tags={},out=[],tagstack=[],linecount=1,lastindex=0;

	var lines=contents.split("\n");
	var errors=[];

	for (var j=0;j<lines.length;j++) {
		var content=lines[j];

		content.replace(/<(.+?)>/g,function(m,m1,idx){

			var space=m1.indexOf(" ");
			if (space>-1) {
				m1=m1.substr(0,space);
			}
			if (!tags[m1]) tags[m1]=0;

			if (m1[0]==='/') {
				if (tagstack.length && tagstack[tagstack.length-1][0]!==m1.substr(1)) {
					errors.push('tag unbalance '+ m1+' line:'+(j+extraline));
				}
				tagstack.pop();
			} else {
				if (m[m.length-2]!=='/') {
					tagstack.push([m1,j+extraline]);
				}
			}
			tags[m1]++;
			tagcount++;
			lastindex=idx+m.length;
		});
	}

	if (tagstack.length!==0) {
		errors=errors.concat(tagstack);
	}
	
	return errors;
}
module.exports=validate;