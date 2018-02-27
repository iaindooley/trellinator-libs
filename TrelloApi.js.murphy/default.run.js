//////////////////////////////////////////////////////
const murphy = require("murphytest");
//////////////////////////////////////////////////////
eval(murphy.load(__dirname,"../TrelloApi.js"));
eval(murphy.load(__dirname,"../TestConnector.js"));
//////////////////////////////////////////////////////
TestConnector.test_base_dir   = __dirname;

var actual = TrelloApi.post("boards/nmWXD05b/lists?name="+encodeURIComponent("New List")+"&pos=top").idBoard;
var expected = "5a938de4e0c2896bd94c7434";

if(actual != expected)
    console.log("Got unexpected board id: "+actual);
