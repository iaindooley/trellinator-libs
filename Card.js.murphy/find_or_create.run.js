const murphy = require("murphytest");
//ADJUST THE PATH TO FIND THE FILES RELATIVE TO YOUR CURRENT DIRECTORY
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
//INCLUDE ANY OTHER REQUIRED FILES HERE
//SET SOME MOCKING VARIABLES
TestConnector.test_base_dir = __dirname;
Trellinator.override_token = "dc1aaaa44446d40ba7a6c1f87e19c222bd172b165b7d5075ec428749e7437181";

/*OPTIONAL
TestConnector.fake_now = new Date("2001-01-01");
TestConnector.prefix = "actual";
ExecutionQueue.fake_push = function(name,params,signature,time)
{

}
*/

//TestConnector.nocache = true;//use this to test performance or do setup/teardown
//ADD YOUR TEST FUNCTIONS HERE
var card = Card.findOrCreate(new Trellinator().board("Iain Dooley Sandbox").list("Started"),"Doesn't exist");
card.moveToNextList();
Card.findOrCreate(new Trellinator().board("Iain Dooley Sandbox").list("Started"),"Doesn't exist").postComment("Found you!");
