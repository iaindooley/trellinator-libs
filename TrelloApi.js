var TrelloApi = function()
{
    this.post = function(baseURL)
    {
        return this.call("post",baseURL);
    }

    this.get = function(baseURL)
    {
        return this.call("get",baseURL);
    }

    this.del = function(baseURL)
    {
        return this.call("get",baseURL);
    }

    this.put = function(baseURL)
    {
        return this.call("get",baseURL);
    }

    this.call = function(method,baseURL)
    {
        var url = this.constructTrelloURL(baseURL);
        var connector = (typeof UrlFetchApp == "undefined")? TestConnector():UrlFetchApp;
        var resp = connector.fetch(url, {"method": method,"muteHttpExceptions":true});
        
        if(typeof Utilities != "undefined")
            Utilities.sleep(5);

        return resp;
    }

    this.constructTrelloURL = function(baseURL)
    {
        var freshURL = "";
        var creds = {key: "dummy",token: "dummy"};

        try
        {
            creds = this.checkControlValues();
        }
        
        catch(e)
        {
        }

        if (baseURL.indexOf("?") == -1)
            freshURL = "https://trello.com/1/"+ baseURL +"?key="+ creds.key + "&token="+ creds.token;
        else
            freshURL = "https://trello.com/1/"+ baseURL +"&key="+ creds.key +"&token="+ creds.token;
        
        return freshURL;
    }

    this.checkControlValues = function()
    { 
        var col = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG_NAME).getRange("B2:B3").getValues();
 
        var appKey = (col[0][0] + "").trim();
 
        if(appKey == "")
            return {key: "", token: "", err: "Trello Key not found in " + CONFIG_NAME + " tab." };
   
        var token = (col[1][0] + "").trim();

        if(token == "")
            return {key: "", token: "", err: "Trello Token not found in " + CONFIG_NAME + " tab." };

        //both found
        return {key: appKey, token: token, err:""};
    }

    return this;
}
