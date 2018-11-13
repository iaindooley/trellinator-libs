const murphy = require("murphytest");
//ADJUST THE PATH TO FIND THE FILES RELATIVE TO YOUR CURRENT DIRECTORY
eval(murphy.load(__dirname,"../../trellinator/Trellinator.js"));
eval(murphy.load(__dirname,"../Notification.js"));
eval(murphy.load(__dirname,"../Card.js"));
eval(murphy.load(__dirname,"../Exceptions.js"));
eval(murphy.load(__dirname,"../Attachment.js"));
eval(murphy.load(__dirname,"../List.js"));
eval(murphy.load(__dirname,"../TrelloApi.js"));
eval(murphy.load(__dirname,"../HttpApi.js"));
eval(murphy.load(__dirname,"../TestConnector.js"));
eval(murphy.load(__dirname,"../IterableCollection.js"));
eval(murphy.load(__dirname,"../IterableCollection.js"));
//INCLUDE ANY OTHER REQUIRED FILES HERE
eval(murphy.load(__dirname,"../Notification.js"));
eval(murphy.load(__dirname,"notifications/attachments.run.js/attached_link.js"));
eval(murphy.load(__dirname,"notifications/attachments.run.js/attached_card.js"));
eval(murphy.load(__dirname,"notifications/attachments.run.js/attached_board.js"));
eval(murphy.load(__dirname,"notifications/attachments.run.js/attached_file.js"));
//SET SOME MOCKING VARIABLES
TestConnector.test_base_dir = __dirname;
//the override_token needs to be set so that when others run your tests
//the new Trellinator() method doesn't fetch their member
//object instead of using your cached api fixtures
//DO NOT INCLUDE YOUR API KEY HERE -- TOKEN ONLY!!!
Trellinator.override_token = "dc1aaaa44446d40ba7a6c1f87e19c222bd172b165b7d5075ec428749e7437181";

/*OPTIONAL
TestConnector.fake_now = new Date("2001-01-01T00:00:00.000Z");
TestConnector.prefix = "actual";
ExecutionQueue.fake_push = function(name,params,signature,time)
{

}
*/

testNoException(new Notification(attached_link),"attachedLink");
testThrowsException(new Notification(attached_link),"attachedCard");
testThrowsException(new Notification(attached_link),"attachedBoard");
//testNoException(new Notification(attached_link),"attachedFile");

testNoException(new Notification(attached_card),"attachedLink");
testNoException(new Notification(attached_card),"attachedCard");
testThrowsException(new Notification(attached_card),"attachedBoard");
//testThrowsException(new Notification(attached_card),"attachedFile");

testNoException(new Notification(attached_board),"attachedLink");
testThrowsException(new Notification(attached_board),"attachedCard");
testNoException(new Notification(attached_board),"attachedBoard");
//testThrowsException(new Notification(attached_board),"attachedFile");

testNoException(new Notification(attached_file),"attachedLink");
testThrowsException(new Notification(attached_file),"attachedCard");
testThrowsException(new Notification(attached_file),"attachedBoard");
//testNoException(new Notification(attached_file),"attachedFile");

new Notification(attached_link).attachedLink().remove();
new Notification(attached_card).attachedCard().remove();
new Notification(attached_board).attachedBoard().remove();
//new Notification(attached_file).attachedFile().remove();

try
{
    new Notification(attached_file).attachedLink(new RegExp(".*\\.gif"));
    new Notification(attached_link).attachedLink(new RegExp(".*Iterable.*"));
}

catch(e)
{
    console.log("Got an exception for correct RegExp");
}

try
{
    new Notification(attached_file).attachedLink(new RegExp(".*\\.pdf"));
    console.log("Should have got an exception for wrong file attachment regexp");
}

catch(e)
{
}

try
{
    new Notification(attached_link).attachedLink(new RegExp(".*Irritable.*"));
    console.log("Should have got an exception for wrong link attachment regexp");
}

catch(e)
{
}

//LIB
function testThrowsException(obj,name)
{
    try
    {
        obj[name]();
        console.log(name+" did not throw an exception but it was supposed to");
    }
    
    catch(e)
    {
    }
}

function testNoException(obj,name)
{
    try
    {
        obj[name]();
    }
    
    catch(e)
    {
        console.log(name+" threw an exception but it wasn't supposed to: "+e);
    }
}
