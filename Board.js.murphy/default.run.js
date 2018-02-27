const murphy = require("murphytest");
eval(murphy.load(__dirname,"../Board.js"));
eval(murphy.load(__dirname,"../TrelloApi.js"));
eval(murphy.load(__dirname,"../TestConnector.js"));
////////////////////////////////////////////////////////////////////////////
TestConnector.test_base_dir   = __dirname;

if(Object.keys(Board({id:"5a938de4e0c2896bd94c7434"}).moveAllCards({from:"Test from",to:"Test to"})).length < 3)
    console.log("Unexpected number of elements returned during move all cards operation");

