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

/////////////////////////////////////////////////////////////////////////////////////////////////
    this.checkControlValues = function()
    { 
  var col = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG_NAME).getRange("B2:B3").getValues();
 
  var appKey = (col[0][0] + "").trim();
 
  if(appKey == "")
  {
    return {key: "", token: "", err: "Trello Key not found in " + CONFIG_NAME + " tab." };
  } 
   
      var token = (col[1][0] + "").trim();

      if(token == "")
      {
        return {key: "", token: "", err: "Trello Token not found in " + CONFIG_NAME + " tab." };
      } 

      //both found
      return {key: appKey, token: token, err:""};
    }

    return this;
}
