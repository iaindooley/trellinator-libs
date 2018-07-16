const murphy = require("murphytest");
//ADJUST THE PATH TO FIND THE FILES RELATIVE TO YOUR CURRENT DIRECTORY
eval(murphy.load(__dirname,"../../trellinator/ExecutionQueue.js"));
eval(murphy.load(__dirname,"../../trellinator/Trellinator.js"));
eval(murphy.load(__dirname,"../../trellinator/Trigger.js"));
eval(murphy.load(__dirname,"../../trellinator/TrigTest.js"));
eval(murphy.load(__dirname,"../Board.js"));
eval(murphy.load(__dirname,"../Card.js")); 
eval(murphy.load(__dirname,"../CheckItem.js"));
eval(murphy.load(__dirname,"../Checklist.js"));
eval(murphy.load(__dirname,"../Comment.js"));
eval(murphy.load(__dirname,"../Exceptions.js"));
eval(murphy.load(__dirname,"../HttpApi.js"));
eval(murphy.load(__dirname,"../IterableCollection.js"));
eval(murphy.load(__dirname,"../Label.js"));
eval(murphy.load(__dirname,"../List.js"));
eval(murphy.load(__dirname,"../Member.js"));  
eval(murphy.load(__dirname,"../Notification.js"));
eval(murphy.load(__dirname,"../Team.js"));
eval(murphy.load(__dirname,"../TestConnector.js"));
eval(murphy.load(__dirname,"../TrelloApi.js"));
//INCLUDE ANY OTHER REQUIRED FILES HERE
//eval(murphy.load(__dirname,"../SystemUnderTest.js"));
//eval(murphy.load(__dirname,"notifications/default.run.js/some_event.js"));
//SET SOME MOCKING VARIABLES
TestConnector.test_base_dir = __dirname;
/*OPTIONAL
TestConnector.fake_now = new Date("2001-01-01");
TestConnector.prefix = "actual";
ExecutionQueue.fake_push = function(name,params,signature,time)
{

}
*/

//TestConnector.nocache = true;//use this to test performance or do setup/teardown
//ADD YOUR TEST FUNCTIONS HERE
new Trellinator().board("Iain Dooley Sandbox").list("Risk Management Reports").cards().each(function(card)
{
    console.log(card.name()+" "+card.movedToList().toLocaleString());
});
