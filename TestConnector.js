const path = require("path");
const fs   = require("fs");
const md5  = require("md5");
const cp   = require('child_process');

var TestConnector = function()
{
    this.fetch = function(url,options)
    {

        try
        {
            if(TestConnector.test_base_dir == "")
                throw "You need to set TestConnector.test_base_dir to __dirname from inside your test script";

            var fixture_path = TestConnector.fixturePath(TestConnector.test_base_dir,url,options);
            var output = "";

            if(TestConnector.nocache)
                throw new Error("Force load");

            var output = fs.readFileSync(fixture_path).toString();
        }
        
        catch(e)
        {
            var live_url = url.replace("key=dummy&token=dummy","key="+TestConnector.live_key+"&token="+TestConnector.live_token);

            if(options.payload)
            {
                var data_string = new IterableCollection(options.payload).implode("&",function(elem,key)
                {
                    if(key == "key")
                        return TestConnector.live_key;
                    else if(key == "token")
                        return TestConnector.live_token;
                    else
                        return encodeURIComponent(elem);
                });
                
                var cmd      = "curl --data \""+data_string+"\" --request "+options.method.toUpperCase()+" --url '"+live_url+"'";
            }
            
            else
                var cmd      = "curl --request "+options.method.toUpperCase()+" --url '"+live_url+"'";

            var stdout = cp.execSync(cmd,{ stdio: ['pipe', 'pipe', 'ignore']});
            
            if(stdout)
            {
                try
                {
                    JSON.parse(stdout);
                }
                
                catch(e)
                {
                    throw new Error("Unable to parse JSON: "+stdout);
                }

                if((TestConnector.test_base_dir != "") && (!TestConnector.nocache))
                {
                    fs.writeFileSync(fixture_path,stdout);
                    var output = fs.readFileSync(fixture_path).toString();
                }
                
                else
                    var output = stdout.toString();
            }
        }

        if(!output)
        {
            console.log("No test return content for: "+fixture_path);
            console.log(JSON.stringify(options));
            console.log(url);
            console.log("Output: "+output);
        }

        return output;
    }
}

TestConnector.test_base_dir = "";
TestConnector.live_key      = process.argv[2];
TestConnector.live_token    = process.argv[3];
TestConnector.prefix        = "";
TestConnector.nocache       = false;

TestConnector.fixturePath = function(base_dir,url,options)
{
    var signature =  md5(url+JSON.stringify(options));
    var fixture_dir = path.resolve(base_dir,"./trello_api_fixtures/"+path.basename(process.argv[1])).toString();
    !fs.existsSync(fixture_dir) && fs.mkdirSync(fixture_dir);
    var fixture_path = fixture_dir+"/"+TestConnector.prefix+signature;
    return fixture_path;
}

function writeInfo_(msg)
{
    console.log(msg);
}

var Trellinator = function()
{
    this.member = new Member({username: Trellinator.username});

    for(var key in this.member)
      this[key] = this.member[key];
}

Trellinator.fakeNow = function()
{
    return new Date(Trellinator.fake_now);
}

Trellinator.now = function()
{
    return (Trellinator.fake_now) ? Trellinator.fakeNow() : new Date();
}

Trellinator.getStack = function()
{
  var stack = "";

  try
  {
    throw new Error("Whoops!");
  }
  catch (e)
  {
    stack = e.stack;
  }

  return stack;
}

Trellinator.username = null;
Trellinator.fake_now = null;
