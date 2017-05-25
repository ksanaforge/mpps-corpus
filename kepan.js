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
var kepanView=[],
treestart=0, //current tree start index of kepanview (tree might cross multiple file)
filestart=0; //current file start index of kepanview (one file might have more than one tree)

var suggestedDepth=function(line){
   var pats=[
      [/(（[壹貳参參肆伍陸柒捌玖拾～]+）)/, 2],
      [/([壹貳参參肆伍陸柒捌玖拾～※]+、)/, 1], //※ for juan 17 禪波羅密
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
   filestart=kepanView.length;
   prevlinenum=0;
}
var renderDepth=function(depth){
   var out="";
   for (var i=0;i<depth;i++) {
      out+=" ";
   }
   return out;
}
// 取得跨卷目錄的抬頭
// 例如 : 卷 40 的第一個標題 （四）法眼淨（承上卷40） 改成
// 卷40 （四）法眼淨（承上卷40）
var get_juan_titla = function(juan)
{
    // 有跨卷的卷數
    var j=[8,9,10,12,14,22,29,34,36,37,39,40,43,47,50,63,64,65,67,69,70,74,75,77,79,81,83,84,87,89,93,94,97,98,100];

    if (j.indexOf(juan) !=-1)
    {
        if(juan<10)
            return "卷0" + juan.toString() + " ";
        else
	        return "卷" + juan.toString() + " ";
    }
    return "";
}
var patchKepan=function(lines,juan){
   var juan_title = get_juan_titla(juan);  // 跨卷的第一個標記要加 卷XX 
   for (i=filestart;i<kepanView.length;i++) {
      var k=kepanView[i];
      var mode=k[0],j=k[3],l=k[4],d=k[1];
      if (j!==juan) break;
      if (d==0) continue;//start of tree is mark as attribute in first H1
      var extra="";
      if (mode!=="L")extra=' m="'+mode+'"';
      //if (d==1&&kepanView[i-1][1]==0) extra+=' start="1"';
      // 本層不要限制為 1
      if (kepanView[i-1][1]==0) extra+=' start="1"';
      var line=lines[l];
      //move pb before $
      line=line.replace(/\$<pb n="(.*)"><\/pb>/,function(m,m1){
         return '<pb n="'+m1+'"></pb>$';
      });
      var starat=line.indexOf("$");
      var tagat=line.indexOf("<note_",starat+1);
      var bracketat=line.indexOf("（卷",starat+1);//（卷xx
      if(bracketat != -1)
        if (tagat != -1 && bracketat < tagat) tagat = bracketat;
        else if(tagat == -1) tagat = bracketat;

      var remain="";
      if (tagat>-1) {
         remain=line.substr(tagat);
      } else {
         tagat=line.length;
      }
      var head=line.substring(starat+1,tagat);
      if (!head) {
         console.log("warning empty head",juan,l);
      }
      // 卷首的標題要加 "卷xx", 層次也要向上二層, 以便對齊
      if(juan_title != "")
      {
          d = d-2;
          if(d<1) d=1;
          // 將標記及 [x] 註解移除
          var pure_head = head.replace(/<.*?>/g,"").replace(/\[\d+\]/g,"");
          line=line.substr(0,starat)+
             "<H"+d+extra+' t="'+juan_title+pure_head+'">'+head+"</H"+d+">"+remain;
      }
      else
      {
          line=line.substr(0,starat)+
             "<H"+d+extra+'>'+head+"</H"+d+">"+remain;
      }
      lines[l]=line;
      juan_title = "";  // 只要第一個標記要 卷xx, 之後就清空
   }
   return lines;
}
var reset=function(text,mode,juan,textlinenum,linenum){
   prevdepth=0;
   adjustdepth=false;
   starkepan=false;//※因論生論
   treestart=kepanView.length;
   prevlinenum=textlinenum;
   var part=mode==1?"J":"L";  
   kepanView.push([part,0,text,juan,linenum,textlinenum]);
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
module.exports={emit, get, newfile,reset,validate,jinAfterKepan, patchKepan};

/* has same text but not counter part
16327,1,貳、為始行菩薩開示修行次第,87,69029,81
>>16398,2,（壹）須菩提問,87,69030,81
*/