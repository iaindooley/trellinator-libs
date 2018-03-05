const murphy = require("murphytest");
eval(murphy.load(__dirname,"../IterableCollection.js"));
eval(murphy.load(__dirname,"../Board.js"));
eval(murphy.load(__dirname,"../List.js"));
eval(murphy.load(__dirname,"../Card.js"));
eval(murphy.load(__dirname,"../TrelloApi.js"));
eval(murphy.load(__dirname,"../TestConnector.js"));
////////////////////////////////////////////////////////////////////////////
TestConnector.test_base_dir   = __dirname;

if(new Board({id:"5a938de4e0c2896bd94c7434"}).moveAllCards({from:"Test from",to:"Test to"}).length < 3)
    console.log("Unexpected number of elements returned during move all cards operation");

if(new Board({id:"5a938de4e0c2896bd94c7434"}).list({name: "Test from"}).name() != 'Test from')
    console.log("Got back incorrect list from Board.list with string");

if(new Board({id:"5a938de4e0c2896bd94c7434"}).list({name: new RegExp("Test .+")}).name() != 'Test from')
    console.log("Got back incorrect list from Board.list with RegExp");

if(new Board({id:"5a938de4e0c2896bd94c7434"}).lists({name: "Test from"}).length() != 1)
    console.log("Got back incorrect list from Board.lists with string");

if(new Board({id:"5a938de4e0c2896bd94c7434"}).lists({name: new RegExp("Test .+")}).length() != 2)
    console.log("Got back wrong number of lists from Board.lists with RegExp");
