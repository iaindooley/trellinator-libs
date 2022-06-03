var WekanApi = function(){};


WekanApi.get = function(endpoint)
{
    return WekanApi.call("get",endpoint);
}

WekanApi.post = function(endpoint,payload)
{
    return WekanApi.call("post",endpoint,payload);
}

WekanApi.del = function(endpoint)
{
    return WekanApi.call("delete",endpoint);
}

WekanApi.put = function(endpoint,payload)
{
    return WekanApi.call("put",endpoint,payload);
}

WekanApi.call = function(method,endpoint,payload)
{
    if(typeof DriveApp === "undefined")
    {
        var fs   = require("fs");
        var cp   = require('child_process');
        WekanApi.url = process.argv[4];
    }
    
    headers = {};

//    if(['post','put'].indexOf(method.toLowerCase()) > -1)
//        headers['Content-Type'] = 'multipart/form-data';

    headers.Authorization = 'Bearer '+WekanApi.login().token;
    //headers.Accept = 'application/json';
    headers['Content-Type'] = 'application/json';
    
    var options = {
        method: method,
        headers: headers,
        payload: payload,
    };

//    var resp = new TestConnector().fetch(WekanApi.url+"/api/"+endpoint,options);
    var live_url = WekanApi.url+"/api/"+endpoint;
    var header_string = "";

    if(options.headers)
    {   
        header_string = '--header "'+new IterableCollection(options.headers).implodeValues('" --header "',function(elem,key)
        {   
            return key+": "+elem;
        })+'" ';
    }

    if(options.payload)
        var cmd = "curl "+header_string+"--data '"+JSON.stringify(options.payload).replaceAll("'","\\'")+"' --request "+options.method.toUpperCase()+' --url "'+live_url+'"';
    else
        var cmd = "curl "+header_string+"--request "+options.method.toUpperCase()+" --url \""+live_url+'\"';

    var stdout = cp.execSync(cmd,{ stdio: ['pipe', 'pipe', 'ignore']});

    if(stdout)
    {
        if((TestConnector.test_base_dir != "") && (!TestConnector.nocache))
        {
            fs.writeFileSync(fixture_path,stdout);
            var output = fs.readFileSync(fixture_path).toString();
        }

        else
            var output = stdout.toString();

        try
        {
            JSON.parse(stdout);
        }

        catch(e)
        {
            throw new InvalidRequestException(stdout);
        }

    }

    if(!output)
    {
        console.log("No test return content for: "+fixture_path);
        console.log(JSON.stringify(options));
        console.log(url);
        console.log("Output: "+output);
    }

    return JSON.parse(stdout);
}

WekanApi.login = function()
{
    if(!WekanApi.login.logindata)
    {
        var options = {
            method: 'post',
            headers: {
                'Content-Type': "application/x-www-form-urlencoded",
                'Accept': "*/*",
            },
            payload: {
                username: TestConnector.live_key,
                password: TestConnector.live_token
            }
        }
        
        var resp = JSON.parse(new TestConnector().fetch(WekanApi.url+'/users/login',options));
        WekanApi.login.logindata = {
            id: resp.id,
            token: resp.token,
        };
    }

    return WekanApi.login.logindata;
}

WekanApi.login.logindata = null;

WekanApi.cardLinkRegExp = function()
{   
    return Trellinator.regex("https:\\/\\/.+?\\/b\\/.+?\\/[a-z\-]+?\\/([a-zA-Z0-9]+)","i");
}

WekanApi.boardLinkRegExp = function()
{
    return Trellinator.regex("https:\\/\\/.+?\\/b\\/(.+?)\\/[a-z\-]+","i");
}
