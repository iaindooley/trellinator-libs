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

var test_connection_log = path.resolve(__dirname,"test_connection.txt");
fs.writeFileSync(test_connection_log,"");
var stream = fs.createWriteStream(test_connection_log, {flags:'a'});

TrelloApi("key","token")
.setConnector(new TestConnector(stream))
.post("cards/9878a9sdadf/idLabels?value=878asdfdf");
stream.end();

stream.once('finish',function()
{
    var expected = "{\"method\":\"post\",\"muteHttpExceptions\":true}\nhttps://trello.com/1/cards/9878a9sdadf/idLabels?value=878asdfdf&key=key&token=token\n";
    var actual = fs.readFileSync(test_connection_log).toString();
    
    if(actual != expected)
        console.log("Unexpected output from TrelloApi in TrelloApi.js.murphy/default.run.js: \n"+actual);
});

