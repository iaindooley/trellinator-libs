var List = function(data)
{    
    this.data      = data;
    this.card_list = null;
  
    this.name = function()
    {
        if(!this.data.name)
            this.load();

        return this.data.name;
    }
    
    this.cards = function(filter)
    {
        if(!this.card_list)
        {
            this.card_list = new IterableCollection(TrelloApi.get("lists/"+this.data.id+"/cards?fields=id,name"));

            this.card_list.transform(function(elem)
            {
                return new Card(elem);
            });
        }

        if(filter && filter.name)
            this.card_list.filterByName(filter.name);
      
        return this.card_list;
    }

    this.countCards = function(params)
    {
        return this.cards().length();
    }
    
    this.rename = function(new_name)
    {
        var updated = TrelloApi.put("lists/"+this.data.id+"/name?value="+encodeURIComponent(new_name));
        this.data.name = updated.name;
        return updated;
    }
    
    this.load = function()
    {
        this.data = TrelloApi.get("lists/"+this.data.id+"?fields=all");
        return this;
    }
}
