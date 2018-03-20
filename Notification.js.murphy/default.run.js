/////////////////////////////////////////////////////
const murphy = require("murphytest");
//////////////////////////////////////////////////////
eval(murphy.load(__dirname,"../Notification.js"));
eval(murphy.load(__dirname,"../List.js"));
eval(murphy.load(__dirname,"../TrelloApi.js"));
eval(murphy.load(__dirname,"../TestConnector.js"));
eval(murphy.load(__dirname,"../IterableCollection.js"));
eval(murphy.load(__dirname,"../IterableCollection.js"));
eval(murphy.load(__dirname,"card_added_to_list_notification_types.js"));
//////////////////////////////////////////////////////
TestConnector.test_base_dir   = __dirname;
TestConnector.live_key      = process.argv[2];
TestConnector.live_token    = process.argv[3];

if(new Notification(createCard).listCardWasAddedTo().name() !== "Hai")
    console.log("Got incorrect list name for createCard in Notification tests");

if(new Notification(copyCard).listCardWasAddedTo().name() !== "Hai")
    console.log("Got incorrect list name for createCard in Notification tests");

if(new Notification(emailCard).listCardWasAddedTo().name() !== "Hai")
    console.log("Got incorrect list name for createCard in Notification tests");

if(new Notification(moveCardToBoard).listCardWasAddedTo().name() !== "Hai")
    console.log("Got incorrect list name for createCard in Notification tests");

if(new Notification(updateCard_moved_list).listCardWasAddedTo().name() !== "Hai")
    console.log("Got incorrect list name for createCard in Notification tests");

if(new Notification(convertToCardFromCheckItem).listCardWasAddedTo().name() !== "Hai")
    console.log("Got incorrect list name for createCard in Notification tests");

