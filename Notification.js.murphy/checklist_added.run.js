/////////////////////////////////////////////////////
const murphy = require("murphytest");
//////////////////////////////////////////////////////
eval(murphy.load(__dirname,"../Notification.js"));
eval(murphy.load(__dirname,"../List.js"));
eval(murphy.load(__dirname,"../Card.js"));
eval(murphy.load(__dirname,"../Checklist.js"));
eval(murphy.load(__dirname,"../TrelloApi.js"));
eval(murphy.load(__dirname,"../TestConnector.js"));
eval(murphy.load(__dirname,"../IterableCollection.js"));
eval(murphy.load(__dirname,"../IterableCollection.js"));
eval(murphy.load(__dirname,"checklist_added.js"));
//////////////////////////////////////////////////////
TestConnector.test_base_dir   = __dirname;
TestConnector.live_key      = process.argv[2];
TestConnector.live_token    = process.argv[3];

if(new Notification(checklist_added).addedChecklist().name() !== "Linked Cards")
    console.log("Got incorrect list name for addedChecklist in Notification tests");

try
{
    new Notification(checklist_added).addedChecklist("Something Else");
    console.log("Should have thrown exception in checklist_added.run.js because checklist is not named Something Else");
}

catch(e)
{
}
