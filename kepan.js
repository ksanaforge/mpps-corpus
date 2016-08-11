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
var kepanView=[],treestart=0;
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

var reset=function(ntree,mode,juan,textlinenum,linenum){
   prevdepth=0;
   treestart=kepanView.length;
   adjustdepth=false;
   starkepan=false;//※因論生論
   prevlinenum=textlinenum;
   var part=mode==1?"J":"L";  
   kepanView.push([part,0,ntree.toString(),juan,linenum,textlinenum]);
}
var starkepan=false;

//踫到經，經緊接之前(中間無文字)的科判視為共享。
var jinAfterKepan=function(textlinenum,linenum){
   k=kepanView.length-1;
   while (kepanView[k][0]=="L" && kepanView[k][5]===textlinenum) {
      kepanView[k][0]="S";//sharing
      k--;
   }
}
//論的科判，往回找相同的經科判，直到0
var findCounterPart=function(text,part){ 
   var normalize=function(tt){
      return tt.replace(/[「（）」]/,"");
   }
   text=normalize(text);
   var now=kepanView.length;

   for (var i=treestart;i<kepanView.length;i++) {
      var t=kepanView[i][2];
      if (text==normalize(t) && (kepanView[i][0]=="J" || kepanView[i][0]=="S")) {
         kepanView[i][0]=now+kepanView[i][0];
         return i;
      }
   }
   return part;
}
var emit=function(text,mode,juan,textlinenum,linenum){
   text=text.replace(/<.*?>/g,"").replace("$","");
   var rangeline=textlinenum-prevlinenum;

   var depth=suggestedDepth(text);
   if (!depth) {
      depth=starkepan?prevdepth:prevdepth+1;
      starkepan=true;
   } else {
      starkepan=false;
      if (depth===3 && prevdepth==1) {
         adjustdepth=1;
         depth--;
      } else {
         if (depth>=3 && adjustdepth) {
            depth--;
         }   
      }      
   }
   
   var part=mode==1?"J":"L";
   if (mode!==1) {
      part=findCounterPart(text,part);
   }
   kepanView.push([part,depth,text,juan,linenum,textlinenum]);

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
module.exports={emit, get, newfile,reset,validate,jinAfterKepan};

/* has same text but not counter part
16327,1,貳、為始行菩薩開示修行次第,87,69029,81
>>16398,2,（壹）須菩提問,87,69030,81
*/