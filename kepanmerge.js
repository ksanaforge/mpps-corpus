
//論的科判，往回找相同的經科判，直到0
var treestart=0;
var matches=0;
var findCounterPart=function(kepan,_text,_depth,_id,now){
   for (i=treestart;i<now;i++) {
      var k=kepan[i];
      var depth=k[0], text=k[1], id=k[2], jin=k[3], match=k[4];
      if (_text==text && _depth==depth && !match) {
         kepan[i][4]=_id;
         kepan[now][4]=id;
         matches++;
      }
   }
}
var matchCounterPart=function(kepan){ 
   //same text and same level, 

   for (var i=1;i<kepan.length;i++) {
      var k=kepan[i];
      var depth=k[0], text=k[1], id=k[2], jin=k[3];
      var juan=parseInt(id);
      if (depth==0) treestart=i;
      //if (juan<37)continue;

      if (!jin) {
         findCounterPart(kepan,text,depth,id,i);
      }
   }
   return kepan;
}

var moveRangeUp=function(kepan,from,to,up){
   var moved=kepan.splice(from-up,up);
   //console.log(moved)
   for (var i=0;i<up;i++) {
      kepan.splice(to-up+i,0,moved[i]);
   }
}
/*
（二）有方便巧學得入菩薩位  36.64
 （7）第七地：不應著二十法，應具足滿二十法
 2、明般若能攝有為與無為諸法相
 3、知諸法實相無生，名無雜毒迴向
 （九）為世間趣故
 2、釋分別三乘疑
 （Ⅵ）八十隨形好
 c、八十隨形好
 （F）取相生著
 2、正為說法
*/
//combine jin kepan splitted by lun kepan
//將經科判往上與前一組合併，以避免跳層
//
var move_from=[7144,8373,8438,10403,10785,10827,12180, 12894,15518,16876,17592,18780]
var move_to=  [7167,8380,8449,10432,10802,10857,12188, 12914,15612,16921,17614,18792];
var up  =     [3   ,46  ,104 ,101  ,41   ,66   , 25   ,14   ,89   ,114  ,92   ,126];

var patch=function(kepan){
   
   for (var i=0;i<move_from.length;i++)   {
      var from=move_from[i],to=move_to[i];
      moveRangeUp(kepan,from,to,up[i]);
      //console.log(from,to,up[i]);
   }
   return kepan;
   
}

var check=function(kepan){
   var prevdepth=0;
   for (var i=0;i<kepan.length;i++) {
      var depth=kepan[i][0];
      if (depth>prevdepth && depth-prevdepth>1){
         console.log("error depth",i,kepan[i][1]);
      }
      prevdepth=depth;
   }
   return kepan;
}

var merge=function(kepan){
   kepan=matchCounterPart(kepan)
   kepan=patch(kepan);
   check(kepan);

   return kepan;   
}

if (process.argv[1].indexOf("kepanmerge.js")>-1){

   var fs=require("fs");
   var kepan=fs.readFileSync("kepan_nomatch.txt","utf8").split("\n");
   kepan=kepan.map(function(k){return k.split("\t")});

   var out=merge(kepan);
   out=kepan.map(function(k){return k.join("\t")});

   console.log("match count",matches);
   fs.writeFileSync("kepan.txt",out.join("\n"),"utf8");
}

module.exports=merge;