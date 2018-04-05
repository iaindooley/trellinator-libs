const murphy = require("murphytest");
eval(murphy.load(__dirname,"../Card.js"));
eval(murphy.load(__dirname,"../Board.js"));
eval(murphy.load(__dirname,"../List.js"));
eval(murphy.load(__dirname,"../Checklist.js"));
eval(murphy.load(__dirname,"../CheckItem.js"));
eval(murphy.load(__dirname,"../TrelloApi.js"));
eval(murphy.load(__dirname,"../TestConnector.js"));
eval(murphy.load(__dirname,"../IterableCollection.js"));
TestConnector.test_base_dir = __dirname;

new Card({id: "5ab1a0d3d9d249e53259c89c"}).completeAllItemsOnChecklist("Quote Preparation");
