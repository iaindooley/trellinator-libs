var HttpApi = function(){};
HttpApi.call = function(method,url,force_get)
{
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
              if(sub_parts[0] != force_get)
                payload[sub_parts[0]] = decodeURIComponent(sub_parts[1]);
              else
                url += "?"+sub_parts[0]+"="+sub_parts[1];
            }
            
            params.payload = payload;
        }
    }

    var connector = (typeof UrlFetchApp == "undefined")? new TestConnector():UrlFetchApp;
    var resp = connector.fetch(url,params);


    if(typeof Utilities != "undefined")
        Utilities.sleep(50);
    
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