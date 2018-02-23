var TrelloApi = function(key,token)
{
    this.key = key;
    this.token = token;
    
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
        //console.log(method+":"+this.constructTrelloURL(baseURL));
        //var resp = UrlFetchApp.fetch(trelloURL, {"method": "post","muteHttpExceptions":true});
        //Utilities.sleep(5);
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
