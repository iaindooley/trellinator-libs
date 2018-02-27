const murphy = require("murphytest");
eval(murphy.load(__dirname,"../IterableCollection.js"));
eval(murphy.load(__dirname,"../List.js"));
eval(murphy.load(__dirname,"../Card.js"));
eval(murphy.load(__dirname,"../TrelloApi.js"));
eval(murphy.load(__dirname,"../TestConnector.js"));
TestConnector.test_base_dir =  __dirname;

if(List({id: "5a94f50cc328f4bc58f959aa"}).name() != "New List")
    console.log("Got incorrect name for list");

if(List({id: "5a94f50cc328f4bc58f959aa"}).rename("Updated List").name != "Updated List")
    console.log("Got incorrect name after renaming list");

if(List({id: "5a94f50cc328f4bc58f959aa"}).countCards() != 3)
    console.log("Got incorrect number of cards in list");
