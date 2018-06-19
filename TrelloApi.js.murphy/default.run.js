/////////////////////////////////////////////////////
const murphy = require("murphytest");
//////////////////////////////////////////////////////
eval(murphy.load(__dirname,"../TrelloApi.js"));
eval(murphy.load(__dirname,"../HttpApi.js"));
eval(murphy.load(__dirname,"../TestConnector.js"));
eval(murphy.load(__dirname,"../IterableCollection.js"));
//////////////////////////////////////////////////////
TestConnector.test_base_dir   = __dirname;

var actual = TrelloApi.post("boards/5b0a731f239d107850fce740/lists?name="+encodeURIComponent("New List")+"&pos=top").idBoard;
var expected = "5b0a731f239d107850fce740";

if(actual != expected)
    console.log("Got unexpected board id: "+actual);
