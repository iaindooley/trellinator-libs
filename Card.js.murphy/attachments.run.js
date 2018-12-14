const murphy = require("murphytest");
//ADJUST THE PATH TO FIND THE FILES RELATIVE TO YOUR CURRENT DIRECTORY
eval(murphy.load(__dirname,"../../trellinator/Trellinator.js"));
eval(murphy.load(__dirname,"../Notification.js"));
eval(murphy.load(__dirname,"../Member.js"));
eval(murphy.load(__dirname,"../Board.js"));
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
eval(murphy.load(__dirname,"../Card.js"));
//eval(murphy.load(__dirname,"notifications/default.run.js/some_event.js"));
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

//TestConnector.nocache = true;//use this to test performance or do setup/teardown
//ADD YOUR TEST FUNCTIONS HERE
var expected = "BEGIN\n"+
"https://www.theprocedurepeople.com/trellinator-automate-trello/docs/module-TrellinatorCore.IterableCollection.html\n"+
"https://www.theprocedurepeople.com/trellinator-automate-trello/docs/module-TrellinatorCore.IterableCollection.html\n"+
"https://www.theprocedurepeople.com/trellinator-automate-trello/docs/module-TrellinatorCore.IterableCollection.html\n"+
"https://www.theprocedurepeople.com/trellinator-automate-trello/docs/module-TrellinatorCore.IterableCollection.html\n"+
"is a link: true\n"+
"is a card: false\n"+
"is a board: false\n"+
"is a file: false\n"+
"END\n"+
"BEGIN\n"+
"https://trello.com/c/FNbaDU6a/340-31-something-street\n"+
"https://trello.com/c/FNbaDU6a/340-31-something-street\n"+
"https://trello.com/c/FNbaDU6a/340-31-something-street\n"+
"https://trello.com/c/FNbaDU6a/340-31-something-street\n"+
"is a link: true\n"+
"is a card: true\n"+
"is a board: false\n"+
"is a file: false\n"+
"END\n"+
"BEGIN\n"+
"https://trello.com/b/2mPJ5dLa/zzz-shipping-template\n"+
"https://trello.com/b/2mPJ5dLa/zzz-shipping-template\n"+
"https://trello.com/b/2mPJ5dLa/zzz-shipping-template\n"+
"https://trello.com/b/2mPJ5dLa/zzz-shipping-template\n"+
"is a link: true\n"+
"is a card: false\n"+
"is a board: true\n"+
"is a file: false\n"+
"END\n"+
"BEGIN\n"+
"DependableFragrantArkshell-max-1mb.gif\n"+
"https://trello-attachments.s3.amazonaws.com/5b0a731f239d107850fce740/5b8f9441119ad87ab0dfcd2b/631a8da0f3e76dc1fc8e94e60d6986e1/DependableFragrantArkshell-max-1mb.gif\n"+
"DependableFragrantArkshell-max-1mb.gif\n"+
"https://trello-attachments.s3.amazonaws.com/5b0a731f239d107850fce740/5b8f9441119ad87ab0dfcd2b/631a8da0f3e76dc1fc8e94e60d6986e1/DependableFragrantArkshell-max-1mb.gif\n"+
"is a link: true\n"+
"is a card: false\n"+
"is a board: false\n"+
"is a file: false\n"+
"END\n";

new Trellinator().board("Iain Dooley Sandbox").card("Test Attachments").cardsLinkedInAttachments().first().link();
new Trellinator().board("Iain Dooley Sandbox").card("Test Attachments").boardsLinkedInAttachments().first().link();
var out = "";

new Trellinator().board("Iain Dooley Sandbox").card("Test Attachments").attachments().each(function(att)
{
    out += "BEGIN\n";
    out += att.name+"\n";
    out += att.url+"\n";
    out += att.text()+"\n";
    out += att.link()+"\n";
    out += "is a link: "+att.isLink()+"\n";
    out += "is a card: "+att.isCard()+"\n";
    out += "is a board: "+att.isBoard()+"\n";
    out += "is a file: "+att.isFile()+"\n";
    out += "END\n";
});

/*if(out != expected)
    console.log("Got incorrect output testing attachments in Card.js.murphy");*/
