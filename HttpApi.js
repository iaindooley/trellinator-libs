/**
* @class HttpApi
* @memberof module:TrellinatorCore
* @constructor
* @classdesc The HttpApi class is mostly used by
* the TrelloApi class for providing the 
* functionality for all the Trello entities, however
* it also provides useful functionality for dealing 
* with many HTTP APIs, especially those that expect
* different methods (put, delete, post, get) and 
* JSON payloads. The main utility of the HttpApi
* class is that it will allow you to call an API
* with any method (post, put, delete, get) using
* a standard query string. This means that, for 
* example you can formulate a POST request that 
* will be sent as a POST, by passing in parameters
* in the query string.
* 
* This class also handles switching between the 
* UrlFetchApp used to make queries in Google Apps
* Script and the TestConnector class which provides
* the same functionality (and caches responses) when
* running your code via node on the command line
* for automated testing purposes.
* @example 
* var url = "https://api.pipedrive.com/v1";
* HttpApi.call("post",url+"/activities/?subject=example&type=call&deal_id=1420&due_date="+
* Trellinator.now().stringFormat("YYYY-MM-DD")+"&due_time="+Trellinator.now().addHours(24).stringFormat("HH:MM")+
* //the "api_token" parameter here is passed to "force_get"
* //which means it will be sent as part of the query string
* //even for put/post queries
* "&api_token=SOMETOKEN&done=1","api_token");
* 
*/
var HttpApi = function(){};

/**
* @memberof module:TrellinatorCore.HttpApi
* @param method {string} one of get, put, delete or post
* @param url {string} the complete URL including all parameters 
* @param force_get {string} (optional) force a parameter to be
*        sent in the GET query string even for post or put queries
*/
HttpApi.call = function(method,url,force_get,headers,payload)
{
  var params  = {"method": method,"muteHttpExceptions":true};
  
  if(!force_get)
      force_get = "";
  
  if(headers)
  {
    params.headers = headers;
  }
  
  if(!payload && ((method == "post") || (method == "put")))
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
        if(force_get.indexOf(sub_parts[0]) == -1)
          payload[sub_parts[0]] = decodeURIComponent(sub_parts[1]);
        else
        {
          if(url.indexOf("?") == -1)
              url += "?"+sub_parts[0]+"="+sub_parts[1];
          else
              url += "&"+sub_parts[0]+"="+sub_parts[1];
        }
      }
      
      params.payload = payload;
    }
  }
  
  else if(payload)
  {
    params.payload = payload;
  }
    
  var connector = (typeof UrlFetchApp == "undefined")? new TestConnector():UrlFetchApp;
  var resp = connector.fetch(url,params);
  
  if(typeof Utilities != "undefined")
    Utilities.sleep(50);
  
  var ret = null;
  
  try
  {
    ret = JSON.parse(resp);
    
    if(ret.error) 
        throw new InvalidRequestException(ret.message);
  }
  
  catch(e)
  {
    throw new InvalidRequestException(resp+" from: "+url+" params: "+JSON.stringify(params));
  }
  
  return ret;
}
