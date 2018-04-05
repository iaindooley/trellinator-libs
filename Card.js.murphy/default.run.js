const murphy = require("murphytest");
eval(murphy.load(__dirname,"../Card.js"));
eval(murphy.load(__dirname,"../Board.js"));
eval(murphy.load(__dirname,"../List.js"));
eval(murphy.load(__dirname,"../Checklist.js"));
eval(murphy.load(__dirname,"../TrelloApi.js"));
eval(murphy.load(__dirname,"../TestConnector.js"));
eval(murphy.load(__dirname,"../IterableCollection.js"));
TestConnector.test_base_dir = __dirname;

new Card({id: "5a94f62b2a126a83233b14dd"}).postComment("hi there");

if(new Card({id: "5a94f62b2a126a83233b14dd"}).setDue("2018-02-28 00:00:00").set_due.due != "2018-02-28T05:00:00.000Z")
    console.log("Got back the wrong due date");

if(new Card({id: "5a94f62b2a126a83233b14dd"}).moveTo({list: new RegExp("Updated List.*"),position: 2}).moved.id != "5a94f62b2a126a83233b14dd")
    console.log("Got incorrect card id back from move card");


if(new Card({id: "5a94f62b2a126a83233b14dd"}).name() != "one")
    console.log("Got incorrect card name");

if(new Card({id: "5a94f62b2a126a83233b14dd"}).setDescription("Here is the description").set_description.id != "5a94f62b2a126a83233b14dd")
    console.log("Got incorrect ID after set description");

if(new Card({id: "5a94f62b2a126a83233b14dd"}).archive().archived.id != "5a94f62b2a126a83233b14dd")
    console.log("Got incorrect ID after archive");

if(new Card({id: "5a94f62b2a126a83233b14dd"}).unArchive().unarchived.id != "5a94f62b2a126a83233b14dd")
    console.log("Got incorrect ID after unarchive");

try
{
    new Card({id: "5a94f62b2a126a83233b14dd"}).addChecklist("My New Checklist",function(cl)
    {
        if(cl.name() != "My New Checklist")
            console.log("Got incorrect name after add checklist");
    }).postComment("Welcome to the jungle");
}

catch(e)
{
    console.log("Error posting comment after adding checklist: "+e);
}
