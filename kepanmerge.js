
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
//combine jin kepan splitted by lun kepan
//將經科判往上與前一組合併，以避免跳層

var patch=function(kepan,error){
   for (var i=0;i<error.length;i++){
      var k=kepan[error[i]];
      if (!k[3]) {//move previous jin segment up
         var from=error[i]-1,to=error[i]-1;
         while (kepan[from][3] &&from){
            from--;
         }
         moveto=from;
         while (!kepan[moveto][3] &&moveto){
            moveto--;
         }
         //console.log(from+1,to,from-moveto);
         moveRangeUp(kepan,from+1,to+1,from-moveto);
      }

   }
   return kepan;
}

var check=function(kepan){
   var prevdepth=0;
   var error=[];
   for (var i=0;i<kepan.length;i++) {
      var depth=kepan[i][0];
      if (depth>prevdepth && depth-prevdepth>1){
         //console.log("error depth",i,kepan[i][1],kepan[i][3]);
         error.push(i);
      }
      prevdepth=depth;
   }
   return error;
}

var mergeWithPrevious=function(kepan){

   kepan=matchCounterPart(kepan)
   var error=check(kepan);
   kepan=patch(kepan,error);
   var error=check(kepan);
   kepan=patch(kepan,error);//need two past to fix all kepan nesting error

   var error=check(kepan);
   if (error.length) {
      error.map(function(i){
         console.log(i,kepan[i][1],kepan[i][2],kepan[i][3]);
      });
   }
   return kepan;   
}

if (process.argv[1].indexOf("kepanmerge.js")>-1){

   var fs=require("fs");
   var kepan=fs.readFileSync("kepan_nomatch.txt","utf8").split("\n");
   kepan=kepan.map(function(k){return k.split("\t")});

   var out=mergeWithPrevious(kepan);
   out=kepan.map(function(k){return k.join("\t")});

   console.log("match count",matches);
   fs.writeFileSync("kepan.txt",out.join("\n"),"utf8");
}

module.exports=mergeWithPrevious;