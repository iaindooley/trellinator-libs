////START MURPHY BOILERPLATE////////////////////////////////////////////////
//Always include this at the start of your script
const path = require("path");
const fs = require("fs");
//Load each file you need for this test
eval(fs.readFileSync(path.resolve(__dirname,"../TrelloApi.js")).toString());
////////////////////////////////////////////////////////////////////////////

TrelloApi("key","token")
.post("cards/9878a9sdadf/idLabels?value=878asdfdf");
