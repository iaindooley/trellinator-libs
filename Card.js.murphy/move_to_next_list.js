const murphy = require("murphytest");
eval(murphy.load(__dirname,"../Card.js"));
eval(murphy.load(__dirname,"../Board.js"));
eval(murphy.load(__dirname,"../List.js"));
eval(murphy.load(__dirname,"../Checklist.js"));
eval(murphy.load(__dirname,"../TrelloApi.js"));
eval(murphy.load(__dirname,"../TestConnector.js"));
eval(murphy.load(__dirname,"../IterableCollection.js"));
TestConnector.test_base_dir = __dirname;
TestConnector.live_key      = process.argv[2];
TestConnector.live_token    = process.argv[3];

new Card({id: "5abadc885d5dbaadacf9352d"}).moveToNextList();
