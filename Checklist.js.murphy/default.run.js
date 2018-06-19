const murphy = require("murphytest");
eval(murphy.load(__dirname,"../Board.js"));
eval(murphy.load(__dirname,"../Member.js"));
eval(murphy.load(__dirname,"../List.js"));
eval(murphy.load(__dirname,"../../trellinator/Trellinator.js"));
eval(murphy.load(__dirname,"../Checklist.js"));
eval(murphy.load(__dirname,"../Card.js"));
eval(murphy.load(__dirname,"../CheckItem.js"));
eval(murphy.load(__dirname,"../TrelloApi.js"));
eval(murphy.load(__dirname,"../HttpApi.js"));
eval(murphy.load(__dirname,"../TestConnector.js"));
eval(murphy.load(__dirname,"../IterableCollection.js"));
TestConnector.test_base_dir = __dirname;
Card.findOrCreate(Board.findOrCreate("Iain Dooley Sandbox").findOrCreateList("New List"),{name: "Test Card"})
.addChecklist("New Checklist",function(list)
{
    list.addItem("First item");
});
