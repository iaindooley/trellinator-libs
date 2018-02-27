const murphy = require("murphytest");
eval(murphy.load(__dirname,"../Card.js"));
eval(murphy.load(__dirname,"../Board.js"));
eval(murphy.load(__dirname,"../List.js"));
eval(murphy.load(__dirname,"../TrelloApi.js"));
eval(murphy.load(__dirname,"../TestConnector.js"));
eval(murphy.load(__dirname,"../IterableCollection.js"));
TestConnector.test_base_dir = __dirname;

if(Card({id: "5a94f62b2a126a83233b14dd"}).postComment("hi there").id != "5a950eb0a34708447dd64637")
    console.log("Error posting comment to card");

if(Card({id: "5a94f62b2a126a83233b14dd"}).setDue("2018-02-28 00:00:00").due != "2018-02-28T05:00:00.000Z")
    console.log("Got back the wrong due date");

if(Card({id: "5a94f62b2a126a83233b14dd"}).moveTo({list: "Updated List",position: 2}).id != "5a94f62b2a126a83233b14dd")
    console.log("Got incorrect card id back from move card");
