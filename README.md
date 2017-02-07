cd msword_pb_kai_kepan
runall  ; Normal.dot must include vbscript/convert.vb

renameall.cmd ; remove leading chinese in filename

====create xhtml format from word xml===
node gen 

====combine 100 juan and break into 3 files===
node combine



===compare mpps lecture with taisho===
node extracttaisho
   generate mpps_taisho.js //the text to be compared with taisho, break by taisho page
            mpps_standoffs.js // stand off markups of each page

node comparetaisho
   compare with taisho text, need ../taisho-corpus/taisho.cor