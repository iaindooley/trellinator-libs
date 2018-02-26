var TrelloApi = function(key,token)
{
    this.key       = key;
    this.token     = token;
    this.connector = (typeof UrlFetchApp == "undefined")? "":UrlFetchApp;
    
    this.setConnector = function(conn)
    {
        this.connector = conn;
        return this;
    }

    this.post = function(baseURL)
    {
        this.call("post",baseURL);
    }

    this.get = function(baseURL)
    {
        this.call("get",baseURL);
    }

    this.del = function(baseURL)
    {
        this.call("get",baseURL);
    }

    this.put = function(baseURL)
    {
        this.call("get",baseURL);
    }

    this.call = function(method,baseURL)
    {
        var resp = this.connector.fetch(this.constructTrelloURL(baseURL), {"method": method,"muteHttpExceptions":true});
        
        if(typeof Utilities != "undefined")
            Utilities.sleep(5);

        return resp;
    }

    this.constructTrelloURL = function(baseURL)
    {
        var freshURL = "";

        if (baseURL.indexOf("?") == -1)
            freshURL = "https://trello.com/1/"+ baseURL +"?key="+ this.key + "&token="+ this.token;
        else
            freshURL = "https://trello.com/1/"+ baseURL +"&key="+ this.key +"&token="+ this.token;
        
        return freshURL;
    }

    return this;
}
