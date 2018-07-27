const murphy = require("murphytest");
eval(murphy.load(__dirname,"../Card.js"));
eval(murphy.load(__dirname,"../Notification.js"));
eval(murphy.load(__dirname,"../../trellinator/Trellinator.js"));
eval(murphy.load(__dirname,"../Exceptions.js"));
eval(murphy.load(__dirname,"../Board.js"));
eval(murphy.load(__dirname,"../Member.js"));
eval(murphy.load(__dirname,"../List.js"));
eval(murphy.load(__dirname,"../Checklist.js"));
eval(murphy.load(__dirname,"../CheckItem.js"));
eval(murphy.load(__dirname,"../TrelloApi.js"));
eval(murphy.load(__dirname,"../HttpApi.js"));
eval(murphy.load(__dirname,"../TestConnector.js"));
eval(murphy.load(__dirname,"../IterableCollection.js"));
////////////////////////////////////////////////////////////////////////////
TestConnector.test_base_dir = __dirname;
Trellinator.override_token = "dc1aaaa44446d40ba7a6c1f87e19c222bd172b165b7d5075ec428749e7437181";

var sandbox = Board.findOrCreate({name: "Iain Dooley Sandbox"});
var from_list = sandbox.findOrCreateList("From List BLAH");
var to_list = sandbox.findOrCreateList("To List BLAH");

for(var i = 0;i < 3;i++)
    Card.create(from_list,{name: i});

sandbox.moveAllCards(from_list,to_list);
TestConnector.prefix = "actual";

if(sandbox.list(new RegExp("To List.*")).cards().length() != 3)
    console.log("Wrong cards in resulting list after moveAllCards in Board.js.murphy/default.run.js");

if(sandbox.list("To List BLAH").cards().length() != 3)
    console.log("Wrong cards in resulting list after moveAllCards testing without regex in Board.js.murphy/default.run.js");

if(sandbox.lists(new RegExp(".*List BLAH")).length() != 2)
    console.log("Wrong number of lists in board in Board.js.murphy/default.run.js");
