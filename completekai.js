var tests=[
["xx<kai></kai>yy","xx<kai></kai>yy"],

["xx<kai>","xx<kai></kai>"],
["xx</kai>","<kai>xx</kai>"],
["<kai>x</kai>","<kai>x</kai>"],
["<kai>x</kai><kai>","<kai>x</kai><kai></kai>"],
["</kai><kai>x</kai>","<kai></kai><kai>x</kai>"],
["xx<kai>y</kai>z<kai>z</kai>zz","xx<kai>y</kai>z<kai>z</kai>zz"]
]

var completeKai=function(line){
	var kstart=line.lastIndexOf("<kai>");
	var kend=line.indexOf("</kai>");

	var kstart1=line.indexOf("<kai>");
	var kend1=line.lastIndexOf("</kai>");

	if (kstart==-1 && kend==-1) return line;

	if ( kstart==-1) return "<kai>"+line;
	if (kend==-1)    return line+"</kai>";
	
	if (kstart>kend1) return line+"</kai>";
	if (kend<kstart1) return "<kai>"+line;

	return line;
}
tests.map(function(t){
	var o=completeKai(t[0]);
	if (t[1]!==o) console.log("error",t,o)
})
