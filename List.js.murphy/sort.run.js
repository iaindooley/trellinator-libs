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
//eval(murphy.load(__dirname,"../SystemUnderTest.js"));
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


var test_board = Board.findOrCreate("Iain Dooley Sandbox");
//SORT ALPHA ASC - DEFAULT

TestConnector.prefix = "alpha_asc";
var sort_alpha_asc = test_board.findOrCreateList("Sort Alpha Asc");
Card.create(sort_alpha_asc,"Beta");
Card.create(sort_alpha_asc,"Alpha");
Card.create(sort_alpha_asc,"Gamma");
sort_alpha_asc.sort();

//SORT ALPHA DESC - DEFAULT
TestConnector.prefix = "alpha_desc";
var sort_alpha_desc = test_board.findOrCreateList("Sort Alpha Desc");
Card.create(sort_alpha_desc,"Beta");
Card.create(sort_alpha_desc,"Alpha");
Card.create(sort_alpha_desc,"Gamma");
sort_alpha_desc.sort(List.SORT_ALPHA_DESC);

//SORT DATE DESC
TestConnector.prefix = "date_desc";
var sort_date_desc = test_board.findOrCreateList("Sort Date Desc");
Card.create(sort_date_desc,"Middle").setDue(Trellinator.now().addDays(1));
Card.create(sort_date_desc,"Bottom").setDue(Trellinator.now());
Card.create(sort_date_desc,"Top").setDue(Trellinator.now().addDays(2));
sort_date_desc.sort(List.SORT_DATE_DESC);

//SORT DATE ASC
TestConnector.prefix = "date_asc";
var sort_date_asc = test_board.findOrCreateList("Sort Date Asc");
Card.create(sort_date_asc,"Middle").setDue(Trellinator.now().addDays(1));
Card.create(sort_date_asc,"Top").setDue(Trellinator.now());
Card.create(sort_date_asc,"Bottom").setDue(Trellinator.now().addDays(2));
sort_date_asc.sort(List.SORT_DATE_ASC);

//USE TO MOVE CARDS FROM WHEN TESTING TIME IN LIST
var wait_list = test_board.findOrCreateList("Wait list");
var middle_til = Card.create(wait_list,"Middle");
var bottom_til = Card.create(wait_list,"Bottom");
var seconds = 2;
//SORT TIME IN LIST DESC
TestConnector.prefix = "til_desc";
var sort_til_desc = test_board.findOrCreateList("Sort Time In List Desc");
Card.create(sort_til_desc,"Top");
//WAIT 10 SECONDS
var waitTill = new Date(new Date().getTime() + seconds * 1000);
while(waitTill > new Date()){}
middle_til.moveToList(sort_til_desc);
//WAIT ANOTHER 10 SECONDS
var waitTill = new Date(new Date().getTime() + seconds * 1000);
while(waitTill > new Date()){}
bottom_til.moveToList(sort_til_desc);
//NOW SORT THE LIST
sort_til_desc.sort(List.SORT_TIME_IN_LIST_DESC);

//SORT TIME IN LIST ASC
TestConnector.prefix = "til_asc";
var middle_til = Card.create(wait_list,"Middle");
var top_til = Card.create(wait_list,"Top");
var sort_til_asc = test_board.findOrCreateList("Sort Time In List Asc");
Card.create(sort_til_asc,"Bottom");
//WAIT 10 SECONDS
var waitTill = new Date(new Date().getTime() + seconds * 1000);
while(waitTill > new Date()){}
middle_til.moveToList(sort_til_asc);
//WAIT ANOTHER 10 SECONDS
var waitTill = new Date(new Date().getTime() + seconds * 1000);
while(waitTill > new Date()){}
top_til.moveToList(sort_til_asc);
//NOW SORT THE LIST
sort_til_asc.sort(List.SORT_TIME_IN_LIST_ASC);
