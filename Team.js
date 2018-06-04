var Team = function(data)
{    
    this.data          = data;
  
    this.name = function()
    {
        if(!this.data.displayName)
            this.load();

        return this.data.displayName;
    }

    this.boards = function(data)
    {
        return this.iterableCollection("organizations/"+this.data.id+"/boards?filter=open&fields=all",
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
        ret.filterByName(TrelloApi.nameTestData(data));
        return ret;
    }
    
    this.load = function()
    {
        this.data = TrelloApi.get("organizations/"+this.data.id);
        return this;
    }
}
