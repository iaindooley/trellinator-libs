const murphy = require("murphytest");
eval(murphy.load(__dirname,"../IterableCollection.js"));
eval(murphy.load(__dirname,"../../trellinator/Trellinator.js"));
var actual = new Array();
var expected = new Array("one","two","three");

new IterableCollection(expected).each(function(arg)
{
    actual.push(arg);
});

if(actual.toString() != expected.toString())
    console.log("Unexpected output 1 in IterableCollection.js.murphy/default.js: "+actual.toString()+" vs "+expected.toString());

var corpus = new IterableCollection(new Array("one","two","three"));
var expected = new Array("mod-one","mod-two","mod-three");

corpus.transform(function(arg)
{
    return "mod-"+arg;
});

if(corpus.asArray().toString() != expected.toString())
    console.log("Unexpected output 2 in IterableCollection.js.murphy/default.js: "+corpus.asArray().toString()+" vs "+expected.toString());
