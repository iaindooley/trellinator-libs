const murphy = require("murphytest");
//ADJUST THE PATH TO FIND THE FILES RELATIVE TO YOUR CURRENT DIRECTORY
eval(murphy.load(__dirname,"../../../apps/trellinator/ExecutionQueue.js"));
eval(murphy.load(__dirname,"../../../apps/trellinator/Trellinator.js"));
eval(murphy.load(__dirname,"../../../apps/trellinator/Trigger.js"));
eval(murphy.load(__dirname,"../../../apps/trellinator/TrigTest.js"));
eval(murphy.load(__dirname,"../../../apps/trellinator-libs/Board.js"));
eval(murphy.load(__dirname,"../../../apps/trellinator-libs/Card.js"));
eval(murphy.load(__dirname,"../../../apps/trellinator-libs/Attachment.js")); 
eval(murphy.load(__dirname,"../../../apps/trellinator-libs/CheckItem.js"));
eval(murphy.load(__dirname,"../../../apps/trellinator-libs/Checklist.js"));
eval(murphy.load(__dirname,"../../../apps/trellinator-libs/Comment.js"));
eval(murphy.load(__dirname,"../../../apps/trellinator-libs/Exceptions.js"));
eval(murphy.load(__dirname,"../../../apps/trellinator-libs/HttpApi.js"));
eval(murphy.load(__dirname,"../../../apps/trellinator-libs/IterableCollection.js"));
eval(murphy.load(__dirname,"../../../apps/trellinator-libs/Label.js"));
eval(murphy.load(__dirname,"../../../apps/trellinator-libs/List.js"));
eval(murphy.load(__dirname,"../../../apps/trellinator-libs/Member.js"));  
eval(murphy.load(__dirname,"../../../apps/trellinator-libs/Notification.js"));
eval(murphy.load(__dirname,"../../../apps/trellinator-libs/Team.js"));
eval(murphy.load(__dirname,"../../../apps/trellinator-libs/TestConnector.js"));
eval(murphy.load(__dirname,"../../../apps/trellinator-libs/TrelloApi.js"));
//INCLUDE ANY OTHER REQUIRED FILES HERE
eval(murphy.load(__dirname,"../Card.js"));
//eval(murphy.load(__dirname,"notifications/default.run.js/some_event.js"));
//SET SOME MOCKING VARIABLES
TestConnector.test_base_dir = __dirname;
//the override_token needs to be set so that when others run your tests
//the new Trellinator() method doesn't fetch their member
//object instead of using your cached api fixtures
//DO NOT INCLUDE YOUR API KEY HERE -- TOKEN ONLY!!!
Trellinator.override_token = "dc1aaaa44446d40ba7a6c1f87e19c222bd172b165b7d5075ec428749e7437181";
Trellinator.fake_now = new Date("2018-02-28T05:00:00.000Z");
TestConnector.use_sequencer = true;//where multiple URLs need to be cached depending on when they are called
                                   //this is configured by default but not turned on by default
                                   //because otherwise all previously existing tests would need to 
                                   //be refixtured
/*OPTIONAL
TestConnector.prefix = "actual";
ExecutionQueue.fake_push = function(name,params,signature,time)
{

}
*/

//TestConnector.nocache = true;//use this to test performance or do setup/teardown
//ADD YOUR TEST FUNCTIONS HERE
console.log(new Trellinator().board("Iain Dooley Sandbox").card("Custom 2").customFieldValue("My Test Field"));
console.log(new Trellinator().board("Iain Dooley Sandbox").card("Custom 2").customFieldValue("Oh yeah"));
console.log(new Trellinator().board("Iain Dooley Sandbox").card("Custom 2").customFieldValue("My Test Dropdown"));
console.log(new Trellinator().board("Iain Dooley Sandbox").card("Custom 2").customFieldValue("My Test Date"));
console.log(new Trellinator().board("Iain Dooley Sandbox").card("Custom 2").customFieldValue("My Test Number"));
console.log(new Trellinator().board("Iain Dooley Sandbox").card("Custom 2").customFieldValue("Non-existent field"));
