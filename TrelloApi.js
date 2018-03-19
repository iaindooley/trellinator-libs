var TrelloApi = function(){};
TrelloApi.trello_api_key_information = null;

TrelloApi.post = function(baseURL)
{
    return TrelloApi.call("post",baseURL);
}

TrelloApi.get = function(baseURL)
{
    return TrelloApi.call("get",baseURL);
}

TrelloApi.del = function(baseURL)
{
    return TrelloApi.call("delete",baseURL);
}

TrelloApi.put = function(baseURL)
{
    return TrelloApi.call("put",baseURL);
}

TrelloApi.call = function(method,baseURL)
{
    var url     = TrelloApi.constructTrelloURL(baseURL);
    var payload = null;
    var params  = {"method": method,"muteHttpExceptions":true};

    if((method == "post") || (method == "put"))
    {
        if (url.indexOf("?") != -1)
        {
            var parts         = url.split("?");
            var url           = parts[0];
            var payload_parts = parts[1].split("&");
            var payload       = {};
            
            for(var key in payload_parts)
            {
                var sub_parts = payload_parts[key].split("=");
                payload[sub_parts[0]] = sub_parts[1];
            }
            
            params.payload = payload;
        }
    }

    var connector = (typeof UrlFetchApp == "undefined")? new TestConnector():UrlFetchApp;
    var options
    var resp = connector.fetch(url,params);


    if(typeof Utilities != "undefined")
        Utilities.sleep(5);
    
    var ret = null;
  
    try
    {
        ret = JSON.parse(resp);
    }
  
    catch(e)
    {
       writeInfo_("Unable to parse response: "+resp+" from URL: "+url+" with method: "+method+". Got error: "+e);
    }
  
    return ret;
}

TrelloApi.constructTrelloURL = function(baseURL)
{
    var freshURL = "";
    var creds = {key: "dummy",token: "dummy"};

    try
    {
        creds = TrelloApi.checkControlValues();
    }
    
    catch(e)
    {
    }

    if (baseURL.indexOf("?") == -1)
        freshURL = "https://api.trello.com/1/"+ baseURL +"?key="+ creds.key + "&token="+ creds.token;
    else
        freshURL = "https://api.trello.com/1/"+ baseURL +"&key="+ creds.key +"&token="+ creds.token;
    
    return freshURL;
}



TrelloApi.checkControlValues = function()
{
    if(!TrelloApi.trello_api_key_information)
    {
        var col = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG_NAME_).getRange("B2:B3").getValues();
 
        var appKey = (col[0][0] + "").trim();
 
        if(appKey == "")
            TrelloApi.trello_api_key_information = {key: "", token: "", err: "Trello Key not found in " + CONFIG_NAME_ + " tab." };
   
        var token = (col[1][0] + "").trim();

        if(token == "")
            TrelloApi.trello_api_key_information = {key: "", token: "", err: "Trello Token not found in " + CONFIG_NAME_ + " tab." };

        //both f ound
        TrelloApi.trello_api_key_information = {key: appKey, token: token, err:""};
    }
  
    return TrelloApi.trello_api_key_information;
}

//Convenience functions
/**
* Tests if an actual string matches a test,
* whether the test is a string (equal) or a
* regular expression
*/
TrelloApi.nameTest = function(test,actual)
{
    var ret = null;

    if(typeof test === 'string')
    {
        if(actual == test)
            ret = actual;
    }
        
    else if(test.constructor === RegExp)
    {
        if(test.test(actual))
            ret = actual;
    }
    
    else if(test)
    {
        writeInfo_("Unsupported test type: "+(typeof test));
    }
    
    return ret;
}
