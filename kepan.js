/* analyse kepan */
/*

   h1
   <jin/>
   h2
   jinwen
   h3
   <lun/>
   h2
   lunwen
   h3
   h4
	
	jin and lun share h1.
	h2 might be slightly different in text
	h4 is lun own kepan
*/
var kepanView=[];
var suggestedDepth=function(line){
   var pats=[
      [/(（[壹貳参參肆伍陸柒捌玖拾～]+）)/, 2],
      [/([壹貳参參肆伍陸柒捌玖拾～]+、)/, 1],
      [/(（[ⅰⅱⅲⅳⅴⅵⅶⅷⅸⅹ]）)/, 14],
      [/([ⅰⅱⅲⅳⅴⅵⅶⅷⅸⅹ]、)/, 13],
      [/(（[ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ]）)/, 12],
      [/([ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ]、)/, 11],
      [/(（[abcdefghijklmnopqrstuvwxz]）)/, 10],
      [/([abcdefghijklmnopqrstuvwxz]、)/, 9],
      [/(（[ABCDEFGHIJKLMNOPQRSTUVWXYZ]）)/, 8],
      [/([ABCDEFGHIJKLMNOPQRSTUVWXYZ]、)/, 7],
      [/(（[0-9～\-]{1,5}）)/, 6],
      [/([0-9～\-]{1,5}、)/, 5],
      [/(（[一二三四五六七八九十～\-]+）)/, 4], //lowest precedes, normal text might have it
      [/([一二三四五六七八九十～\-]+、)/, 3]
   ];

   for (var i=0;i<pats.length;i++) {
      if ( line.match( pats[i][0]) ) {
         return pats[i][1];
      }
   }
   return 0; //maybe 因論生論 follow the previous note
}
var prevlinenum=0,prevdepth=0,
adjustdepth=false;//before juan 40 , level 2 is missing
var newfile=function(){
   prevlinenum=0;
}
var renderDepth=function(depth){
   var out="";
   for (var i=0;i<depth;i++) {
      out+=" ";
   }
   return out;
}

var reset=function(ntree,juan,textlinenum){
   prevdepth=0;
   adjustdepth=false;
   prevlinenum=textlinenum;
   kepanView.push("0\t========="+ntree+"=========卷"+juan);
}
var emit=function(text,mode,textlinenum,linenum){
   text=text.replace(/<.*?>/g,"");
   var rangeline=textlinenum-prevlinenum;
   if (rangeline>0) {
      kepanView[kepanView.length-1]+="------"+rangeline;
   }
   var depth=suggestedDepth(text);
   if (!depth) depth=prevdepth;
   else {
      if (depth===3 && prevdepth==1) {
         adjustdepth=1;
         depth--;
      } else {
         if (depth>=3 && adjustdepth) {
            depth--;
         }   
      }      
   }
   
   if (mode==1) {
      kepanView.push(depth+"\t"+renderDepth(depth)+text+"(經)");
   } else {
      kepanView.push(depth+"\t"+renderDepth(depth)+text);
   }
   prevdepth=depth;
   prevlinenum=textlinenum;
}
var validate=function(){
   var prevdepth=0,out=[],head="";
   for(var i=0;i<kepanView.length;i++) {
      var k=kepanView[i];
      var depth=parseInt(k);
      if (depth==0) head=k;
      if (depth-prevdepth>1) {
         out.push("===line "+i+" "+head)
         out.push(kepanView[i-1]);
         out.push(k);
      }
      prevdepth=depth;
   }
   return out;
}
var get=function(){
   return kepanView.join("\n");
}
module.exports={emit, get, newfile,reset,validate};
