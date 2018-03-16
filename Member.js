var Member = function(data)
{    
    this.data      = data;
  
    this.fullName = function()
    {
        if(!this.data.fullName)
            this.load();

        return this.data.fullName;
    }

    this.username = function()
    {
        return this.name();
    }

    this.name = function()
    {
        if(!this.data.username)
            this.load();

        return this.data.username;
    }
    
    this.load = function()
    {
        this.data = TrelloApi.get("members/"+this.data.id+"?fields=id,username,fullName");
        return this;
    }
    
    this.board = function(data)
    {
        return this.boards(data).first();
    }

    this.boards = function(data)
    {
        return this.iterableCollection("members/"+this.username()+"/boards?filter=open&fields=all&lists=open&memberships=none&organization_fields=name%2CdisplayName",
                                       data,
                                       function(elem)
                                       {
                                           return new Board(elem);
                                       });
    }

    this.iterableCollection = function(url,data,callback)
    {
        var ret = new IterableCollection(TrelloApi.get(url));

        ret.transform(callback);

        if(data && data.name)
            ret.filterByName(data.name);
        
        return ret;
    }
}
