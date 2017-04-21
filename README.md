master MSWORD FILE in https://drive.google.com/drive/folders/0Bw3YnwlH6NQwbHB4NTJXN3NmZ3c

Normal.dot must include vbscript/convert.vb

===convert MSword to XML===
cd msword
runall_lb   ; output with lb breaks but foot note is lost

runall_para ; output without linebreaks with foot note number

===combine linbreaks in xml_lb to xml====
node mergepb

===create xhtml format from word xml , 每一卷一個  xhtml===
node genxml



====create  kepan-map.json====
node parsejinlunmapping

====create xml for building corpus ====
node gencorpusxml

====create mpps.cor====
node gen



======obsolute=====







===combine 100 juan and break into 3 files, 轉成json ，供 經論對讀使用 ===
node combine

for https://github.com/ksanaforge/mahaprajnaparamitasastra


===extract taisho text from mpps_lecture ，將講義中的大正經文與科文注釋分離為standoff markups===
node extracttaisho
   generate mpps_taisho.js //the text to be compared with taisho, break by taisho page
            mpps_standoffs.js // stand off markups of each page


===compare mpps_lecture text with taisho layout，經文比較，計算standoff markups 在大正藏的位置===
node comparetaisho
   compare with taisho text, need ../taisho-corpus/taisho.cor
   output mpps_standoffs_converted.js

===generate external fields format for accelon, 產生accelon 接受的standoff markups 格式===
node genfields
	generate external kdb fields from mpps_standoffs_converted.js
	output mpps_fields.js

