var Board = function(data)
{    
    this.data = data;
  
    this.moveAllCards = function(data)
    {
        //data.from == RegExp, data.to == RegExp
        var lists = TrelloApi.get("boards/"+this.data.id+"/lists?filter=open&fields=all");
        var from_list = null;
        var to_list = null;

        for(var key in lists)
        {
            if(TrelloApi.nameTest(data.from,lists[key].name))
                from_list = lists[key];
            else if(TrelloApi.nameTest(data.to,lists[key].name))
                to_list = lists[key];
        }
        
        return TrelloApi.post("lists/"+from_list.id+"/moveAllCards?idBoard="+to_list.idBoard+"&idList="+to_list.id);
    }

    this.list = function(data)
    {
        var lists = this.lists(data);
        
        for(var key in lists)
           return lists[key];
    }

    this.lists = function(data)
    {
        var lists = TrelloApi.get("boards/"+this.data.id+"/lists?filter=open&fields=all");
        var ret = lists;

        if(data.name)
        {
            ret = [];

            for(var key in lists)
            {
                if(TrelloApi.nameTest(data.name,lists[key].name))
                    ret[key] = lists[key];
            }
        }

        return ret;
    }

    return this;
}
