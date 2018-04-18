/////////////////////////////////////////////////////
const murphy = require("murphytest");
//////////////////////////////////////////////////////
eval(murphy.load(__dirname,"../Notification.js"));
eval(murphy.load(__dirname,"../Card.js"));
eval(murphy.load(__dirname,"../List.js"));
eval(murphy.load(__dirname,"../Checklist.js"));
eval(murphy.load(__dirname,"../TrelloApi.js"));
eval(murphy.load(__dirname,"../TestConnector.js"));
eval(murphy.load(__dirname,"../IterableCollection.js"));
eval(murphy.load(__dirname,"../IterableCollection.js"));
eval(murphy.load(__dirname,"not_final_checklist_item.js"));
eval(murphy.load(__dirname,"final_checklist_item.js"));
//////////////////////////////////////////////////////
TestConnector.test_base_dir   = __dirname;
TestConnector.live_key      = process.argv[2];
TestConnector.live_token    = process.argv[3];

try
{
    new Notification(not_final_checklist_item).completedChecklist("Approval");
    console.log("Checklist Approval should not have been completed with the not final checklist item");
}

catch(e)
{
    console.log("Successfully detected this was not the notification to mark the checklist complete");
}

try
{
    new Notification(final_checklist_item).completedChecklist("Approval");
    console.log("Successfully detected as complete");
}

catch(e)
{
    console.log("Checklist Approval should have been completed with the not final checklist item");
}
