var TrelloApi = function(){};
TrelloApi.trello_api_key_information = null;

TrelloApi.cardLinkRegExp = function()
{
    return new RegExp("https:\\/\\/trello\\.com\\/c\\/([A-Za-z0-9]+)","i");
}

TrelloApi.boardLinkRegExp = function()
{
    return new RegExp("https:\\/\\/trello\\.com\\/b\\/([A-Za-z0-9]+)","i");
}

TrelloApi.post = function(baseURL)
{
    return HttpApi.call("post",TrelloApi.constructTrelloURL(baseURL));
}

TrelloApi.get = function(baseURL)
{
    return HttpApi.call("get",TrelloApi.constructTrelloURL(baseURL));
}

TrelloApi.del = function(baseURL)
{
    return HttpApi.call("delete",TrelloApi.constructTrelloURL(baseURL));
}

TrelloApi.put = function(baseURL)
{
    return HttpApi.call("put",TrelloApi.constructTrelloURL(baseURL));
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

/*
Either a string or an object passed in containing a name, or regex
*/
TrelloApi.nameTestData = function(data,item_name)
{
    var ret = null;
    
    if(!item_name)
        item_name = "name";

    if((typeof data == "string") || ((typeof data !== "undefined") && (data.constructor === RegExp)))
        ret = data;
    else if(data && data[item_name])
        ret = data[item_name];

    return ret;
}
