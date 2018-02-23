////START MURPHY BOILERPLATE////////////////////////////////////////////////
//Always include this at the start of your script
const path = require("path");
const fs = require("fs");
//Load each file you need for this test
eval(fs.readFileSync(path.resolve(__dirname,"../Board.js")).toString());
////////////////////////////////////////////////////////////////////////////

Board({id:"87asdfadf"})
.moveCards({from:"One",to:"Two"})
.findCard({list:"Two",name:/Cards in ".+"/})
.move({to:"One",position:"top"});

