const murphy = require("murphytest");
eval(murphy.load(__dirname,"../Board.js"));
////////////////////////////////////////////////////////////////////////////

Board({id:"87asdfadf"})
.moveCards({from:"One",to:"Two"})
.findCard({list:"Two",name:/Cards in ".+"/})
.move({to:"One",position:"top"});

