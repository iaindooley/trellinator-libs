const murphy = require("murphytest");
eval(murphy.load(__dirname,"../IterableCollection.js"));
var actual = new Array();
var expected = new Array("one","two","three");

IterableCollection(expected).each(function(arg)
{
    actual.push(arg);
});

if(actual.toString() != expected.toString())
    console.log("Unexpected output in IterableCollection.js.murphy/default.js: "+actual.toString());

var corpus = new Array("one","two","three");
var expected = new Array("mod-one","mod-two","mod-three");

IterableCollection(corpus).transform(function(arg)
{
    return "mod-"+arg;
});

if(corpus.toString() != expected.toString())
    console.log("Unexpected output in IterableCollection.js.murphy/default.js: "+corpus.toString());
