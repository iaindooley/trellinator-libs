var TrelloApi = function(){};
TrelloApi.trello_api_key_information = null;

/**
* query: same as advanced search query in Trello
* teams: an array of team objects
*/
TrelloApi.searchCardsInTeams= function(teams,query)
{
  if(teams.constructor === IterableCollection)
  {
    var team_ids = encodeURIComponent(teams.transform(function(team)
                                                      {
                                                        return team.data.id;
                                                      }).implodeValues(","));
  }
  
  else if(teams.constructor === Team)
    var team_ids = teams.data.id;
  
  else
    throw new Error("You need to either pass in a Team object or an IterableCollection of teams to the searchCardsInTeams method");
  
  var url = "search?query="+encodeURIComponent(query)+"&idOrganizations="+team_ids+"&modelTypes=cards&partial=true&board_fields=name%2CidOrganization&boards_limit=10&card_fields=all&cards_limit=10&cards_page=0&card_attachments=false&organization_fields=name%2CdisplayName&organizations_limit=10&member_fields=avatarHash%2CfullName%2Cinitials%2Cusername%2Cconfirmed&members_limit=10";

  return new IterableCollection(TrelloApi.get(url).cards).transform(function(elem)
             {
               return new Card(elem);
             });
}

/**
* query: same as advanced search query in Trello
* boards: an array of board objects or "mine"
*/
TrelloApi.searchCardsInBoards = function(boards,query)
{
  if(boards.constructor === IterableCollection)
  {
    var board_ids = encodeURIComponent(boards.transform(function(board)
                                                        {
                                                          return board.data.id;
                                                        }).implodeValues(","));
  }
  
  else if(boards.constructor === Board)
    var board_ids = boards.data.id;
  
  else if(boards === "mine")
    board_ids = boards;
  
  else
    throw new Error("You need to either pass in an IterableCollection of Board objects, a single Board object, or the string mine to the searchCardsInBoards method");
  
  var url = "search?query="+encodeURIComponent(query)+"&idBoards="+board_ids+"&modelTypes=cards&partial=true&board_fields=name%2CidOrganization&boards_limit=10&card_fields=all&cards_limit=10&cards_page=0&card_attachments=false&organization_fields=name%2CdisplayName&organizations_limit=10&member_fields=avatarHash%2CfullName%2Cinitials%2Cusername%2Cconfirmed&members_limit=10";
  return new IterableCollection(TrelloApi.get(url).cards)
  .transform(function(elem)
             {
               return new Card(elem);
             });
}

TrelloApi.cardLinkRegExp = function()
{
    return new RegExp(".*https:\\/\\/trello\\.com\\/c\\/([A-Za-z0-9]+)","i");
}

TrelloApi.boardLinkRegExp = function()
{
    return new RegExp(".*https:\\/\\/trello\\.com\\/b\\/([A-Za-z0-9]+)","i");
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
    creds = TrelloApi.checkControlValues();

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
        if(Trellinator.isGoogleAppsScript())
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
        
        else
        {
            TrelloApi.trello_api_key_information = {key: "dummy", token: "dummy", err:""};
        }
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
        
    else if(test && (test.constructor === RegExp))
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

    if((typeof data == "string") || (data && (typeof data !== "undefined") && (data.constructor === RegExp)))
        ret = data;
    else if(data && data[item_name])
        ret = data[item_name];

    return ret;
}
