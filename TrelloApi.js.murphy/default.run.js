//////////////////////////////////////////////////////
const path = require("path");
const fs = require("fs");
const murphy = require("murphytest");
const glob = require("glob")
const {exec} = require('child_process');
const cmd = "node ";
//////////////////////////////////////////////////////
eval(murphy.load(__dirname,"../TrelloApi.js"));
eval(murphy.load(__dirname,"../TestConnector.js"));
//////////////////////////////////////////////////////
TestConnector.path = __dirname;

var actual = TrelloApi().post("cards/9878a9sdadf/idLabels?value=878asdfdf");

var expected = "{\"method\":\"post\",\"muteHttpExceptions\":true}\nhttps://trello.com/1/cards/9878a9sdadf/idLabels?value=878asdfdf&key=key&token=token\n";
    
if(actual != expected)
    console.log("Unexpected output from TrelloApi in TrelloApi.js.murphy/default.run.js: \n"+actual);

