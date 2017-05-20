/*
	將 xml 數個較長的標題手動處理
*/
"use strict";
var fs=require("fs");
var count = 0;
var change_count = 0;
debugger
// 卷五
// (十）欲知一切眾生心、一切眾生根、一切世界中諸劫次第、欲斷一切眾生諸煩惱悉無餘故發菩提心

var filename = "xml/005-D08.xml";
var content=fs.readFileSync(filename,"utf8");

count++;
content=content.replace(/<p\/>(<a n="9.16"\/><H3 to="9.0">（十）)/g,function(m,m1){
	change_count++;
	return m1;
});

count++;
content=content.replace(/(無餘故發菩)(<\/H3>)\r?\n<b>(提心)<\/b>/g,function(m,m1,m2,m3){
	change_count++;
	return m1+"\n"+m3+m2;
});

fs.writeFileSync(filename,content,"utf8");

// 卷八
// 八、一切眾生皆得等心相視，等行十善，惔然快樂，如入第三禪，皆得好慧，持戒自守，不嬈眾生

filename = "xml/008-D07.xml";
content=fs.readFileSync(filename,"utf8");

count++;
content=content.replace(/<p\/>(<a n="14.199"\/><H2>八、一切眾生)/g,function(m,m1){
	change_count++;
	return m1;
});

count++;
content=content.replace(/(持戒自守，不嬈眾)(<\/H2>)\r?\n<b>(生)<\/b>/g,function(m,m1,m2,m3){
	change_count++;
	return m1+"\n"+m3+m2;
});

fs.writeFileSync(filename,content,"utf8");

// 卷10
// （二）佛實不動，先福因緣，身遍出聲應物如響，身毛孔中自然有聲隨心說法，佛無憶想亦無分別

filename = "xml/010-D08.xml";
content=fs.readFileSync(filename,"utf8");

count++;
content=content.replace(/<p\/>(<a n="15.\d+"\/><H4>（二）佛實不動)/g,function(m,m1){
	change_count++;
	return m1;
});

count++;
content=content.replace(/(說法，佛無憶想亦無)(<\/H4>)\r?\n<b>(分別)<\/b>/g,function(m,m1,m2,m3){
	change_count++;
	return m1+"\n"+m3+m2;
});

fs.writeFileSync(filename,content,"utf8");

// 卷26
//（4）外道聽佛說法，初雖為魔所覆故默然，但後魔弊得離，皆向佛而為佛弟子

filename = "xml/026-MP-04.xml";
content=fs.readFileSync(filename,"utf8");

count++;
content=content.replace(/(但後魔弊得離，皆向佛而為佛弟)(<\/H6>)\r?\n<b>(子)<\/b>/g,function(m,m1,m2,m3){
	change_count++;
	return m1+"\n"+m3+m2;
});

fs.writeFileSync(filename,content,"utf8");

// 卷37
//（二）行空相應能不墮二地，能淨佛土，成就眾生，疾得菩提，生大慈大悲，不生六蔽<del>〔如下經文〕</del>

filename = "xml/037-MP-07.xml";
content=fs.readFileSync(filename,"utf8");

count++;
content=content.replace(/<p\/>(<a n="54.529"\/><H3>（二）行空相)/g,function(m,m1){
	change_count++;
	return m1;
});

count++;
content=content.replace(/(生大慈大悲，不生六蔽)(〔如下)(<\/H3>)\r?\n<b>(經文〕)<\/b>/g,function(m,m1,m2,m3,m4){
	change_count++;
	return m1+m3+m2+"\n"+m4;
});

fs.writeFileSync(filename,content,"utf8");

// 卷56．p1598 	
// （3）魔作恐怖事多不現本形，是故說「諸法空」；人來惡口罵詈、刀杖打斫，故用「四無量心」

filename = "xml/056-MP-05.xml";
content=fs.readFileSync(filename,"utf8");

count++;
content=content.replace(/(罵詈、刀杖打斫，故用「四)(<\/H6>)\r?\n<b>(無量心」)<\/b>/g,function(m,m1,m2,m3){
	change_count++;
	return m1+"\n"+m3+m2;
});

fs.writeFileSync(filename,content,"utf8");

// 卷59
// （B）持誦般若功德──具六度眾德住菩薩位，得勝神通遊諸佛國，隨類應現，成就眾生

filename = "xml/059-MP-05.xml";
content=fs.readFileSync(filename,"utf8");

count++;
content=content.replace(/<p\/>(<a n="88.86"\/><H8 to="88.88" m="J">（B）持誦般若)/g,function(m,m1){
	change_count++;
	return m1;
});

count++;
content=content.replace(/(佛國，隨類應現，成就)(<\/H8>)\r?\n<b>(眾生)<\/b>/g,function(m,m1,m2,m3){
	change_count++;
	return m1+"\n"+m3+m2;
});

fs.writeFileSync(filename,content,"utf8");

// 卷61．p1744 	
// 三、「無著迴向」勝「十方如恒沙等世界眾生，如恒沙等劫供養大千世界中皆發菩提心之菩薩」

filename = "xml/061-MP-05.xml";
content=fs.readFileSync(filename,"utf8");

count++;
content=content.replace(/<p\/>(<a n="90.242"\/><H3 m="J">三、「無著)/g,function(m,m1){
	change_count++;
	return m1;
});

count++;
content=content.replace(/(大千世界中皆發菩提心之菩)(<\/H3>)\r?\n<b>(薩」)<\/b>/g,function(m,m1,m2,m3){
	change_count++;
	return m1+"\n"+m3+m2;
});

fs.writeFileSync(filename,content,"utf8");

// 卷86
// （b）初禪欲離欲界煩惱不善大障故名「離生」，二禪滅初禪覺觀，內心清淨而得名「定生」

filename = "xml/086-MP-05.xml";
content=fs.readFileSync(filename,"utf8");

count++;
content=content.replace(/<p\/>(<a n="126.58"\/><H10>（b）初禪欲離)/g,function(m,m1){
	change_count++;
	return m1;
});

count++;
content=content.replace(/(初禪覺觀，內心清淨而得名「定)(<\/H10>)\r?\n<b>(生」)<\/b>/g,function(m,m1,m2,m3){
	change_count++;
	return m1+"\n"+m3+m2;
});

fs.writeFileSync(filename,content,"utf8");

// 卷100 
// ※ 因論生論：應說「般若相」，云何說「平等」；般若不一不異相，何故取平等一相

filename = "xml/100-MP-03.xml";
content=fs.readFileSync(filename,"utf8");

count++;
content=content.replace(/(般若不一不異相，何故取平等一)(<\/H8>)\r?\n<b>(相)<\/b>/g,function(m,m1,m2,m3){
	change_count++;
	return m1+"\n"+m3+m2;
});

fs.writeFileSync(filename,content,"utf8");

// check 

if(count == change_count) console.log("OK");
else {
	var msg = "count error, need change : " + count.toString() + " vs " + change_count.toString() + " \ncheck it now!!"
	console.log(msg);
}