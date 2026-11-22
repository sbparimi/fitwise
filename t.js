
const fs=require('fs');eval(fs.readFileSync(__dirname+'/engine.js','utf8')+";global.tailorRules=tailorRules;");
const r=tailorRules(fs.readFileSync(__dirname+'/test_cv.txt','utf8'),fs.readFileSync(__dirname+'/test_jd.txt','utf8'));
console.log(JSON.stringify(r,null,1));
