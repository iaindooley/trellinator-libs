const path = require("path");
const fs = require("fs");
const md5 = require("md5");

var TestConnector = function()
{
    this.fetch = function(url,options)
    {
        var signature = md5(url+JSON.stringify(options));
        var fixture_path = path.resolve(TestConnector.path,TestConnector.trello_api_fixture_path+"/"+signature);
        var output = "";

        try
        {
            var output = fs.readFileSync(fixture_path).toString();
        }
        
        catch(e)
        {
            console.log("No test return content for: "+fixture_path);
            console.log(JSON.stringify(options));
            console.log(url);
        }
        
        return output;
    }
    
    return this;
}

TestConnector.trello_api_fixture_path = "trello_api_fixtures";
