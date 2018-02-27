const murphy = require("murphytest");
eval(murphy.load(__dirname,"../Board.js"));
eval(murphy.load(__dirname,"../TrelloApi.js"));
eval(murphy.load(__dirname,"../TestConnector.js"));
////////////////////////////////////////////////////////////////////////////

Board({id:"87asdfadf"})
.moveAllCards({from:"One",to:"Two"});

Board({id:"87asdfadf"})
.list({name:"One",to:"Two"});
