const murphy = require("murphytest");
eval(murphy.load(__dirname,"../IterableCollection.js"));
eval(murphy.load(__dirname,"../Board.js"));
eval(murphy.load(__dirname,"../List.js"));
eval(murphy.load(__dirname,"../Card.js"));
eval(murphy.load(__dirname,"../TrelloApi.js"));
eval(murphy.load(__dirname,"../../trellinator/Supporting.js"));
eval(murphy.load(__dirname,"../TestConnector.js"));
////////////////////////////////////////////////////////////////////////////
TestConnector.test_base_dir = __dirname;
TestConnector.live_key      = process.argv[2];
TestConnector.live_token    = process.argv[3];

var sut = new Board({id:"5a938de4e0c2896bd94c7434"}).moveAllCards({from: new RegExp("Test from.*"),to: new RegExp("Test to.*")});
if(sut.length < 3)
    console.log("Unexpected number of elements returned during move all cards operation");

var sut = new Board({id:"5a938de4e0c2896bd94c7434"}).list({name: new RegExp("Test from.*")});
if(!/Test from.*/.test(sut.name()))
    console.log("Got back incorrect list from Board.list with string: "+sut.name());

var sut = new Board({id:"5a938de4e0c2896bd94c7434"}).list({name: new RegExp("Test .+")});
if(!/Test .+/.test(sut.name()))
    console.log("Got back incorrect list from Board.list with RegExp: "+sut.name());

var sut = new Board({id:"5a938de4e0c2896bd94c7434"}).lists({name: new RegExp("Test from.*")});
if(sut.length() != 1)
    console.log("Got back incorrect list from Board.lists with string: "+sut.length());

var sut = new Board({id:"5a938de4e0c2896bd94c7434"}).lists({name: new RegExp("Test .+")});
if(sut.length() != 2)
    console.log("Got back wrong number of lists from Board.lists with RegExp");
