const path = require("path");
const fs = require("fs");
const md5 = require("md5");

var TestConnector = function()
{
    this.fetch = function(url,options)
    {
        if(TestConnector.test_base_dir == "")
            throw "You need to set TestConnector.test_base_dir to __dirname from inside your test script";

        var fixture_path = TestConnector.fixturePath(TestConnector.test_base_dir,url,options);
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
            console.log(e);
        }
        
        return output;
    }

    
    return this;
}

TestConnector.test_base_dir   = "";

TestConnector.fixturePath = function(base_dir,url,options)
{
    var signature =  md5(url+JSON.stringify(options));
    var fixture_path = path.resolve(base_dir,"./trello_api_fixtures/").toString()+"/"+signature;
    return fixture_path;
}
