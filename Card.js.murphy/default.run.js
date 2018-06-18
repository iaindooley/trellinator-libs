const murphy = require("murphytest");
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
TestConnector.test_base_dir = __dirname;

fetchTestCard("one").postComment("hi there");

if(fetchTestCard("two").setDue("2018-02-28 00:00:00").load().due() != "2018-02-28T05:00:00.000Z")
    console.log("Got back the wrong due date");

Board.findOrCreate("Iain Dooley Sandbox").findOrCreateList("Moved To");

if(fetchTestCard("three").moveTo("Moved To","top").load().currentList().name() != "Moved To")
    console.log("Did not move card");

if(fetchTestCard("Test Card").name() != "Test Card")
    console.log("Got incorrect card name");

if(fetchTestCard("four").setDescription("Here is the description").load().description() != "Here is the description")
    console.log("Got incorrect ID after set description");

fetchTestCard("five").archive().unArchive();
fetchTestCard("six").moveToNextList();

var card = fetchTestCard("seven");
TestConnector.prefix = "expected";

card.addChecklist("Quote Preparation",function(list)
{
    list.addItem("Test");
});

TestConnector.prefix = "expected2";

card.completeAllItemsOnChecklist("Quote Preparation");

TestConnector.prefix = "actual";

if(!card.load().checklist("Quote Preparation").item("Test").isComplete())
    console.log("Could not complete all checklist items");

TestConnector.prefix = "";

try
{
    new fetchTestCard("eight").addChecklist("My New Checklist",function(cl)
    {
        if(cl.name() != "My New Checklist")
            console.log("Got incorrect name after add checklist");
    }).postComment("Welcome to the jungle");
}

catch(e)
{
    console.log("Error posting comment after adding checklist: "+e);
}

function fetchTestCard(name)
{
    if(!name)
        name = new Date().getTime();

    var sandbox = Board.findOrCreate("Iain Dooley Sandbox");
    var sandbox_list = sandbox.findOrCreateList("Test List");
    return Card.create(sandbox_list,{name: name});
}
