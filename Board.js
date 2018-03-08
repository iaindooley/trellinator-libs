var Board = function(data)
{    
    this.data = data;

    this.name = function()
    {
        if(!this.data.name)
            this.load();
        
        return this.data.name;
    }
  
    this.moveAllCards = function(data)
    {
        //data.from == RegExp, data.to == RegExp
        var lists = TrelloApi.get("boards/"+this.data.id+"/lists?cards=none&card_fields=none&filter=open&fields=all");
        var from_list = null;
        var to_list = null;

        for(var key in lists)
        {
            if(TrelloApi.nameTest(data.from,lists[key].name))
                from_list = lists[key];
            else if(TrelloApi.nameTest(data.to,lists[key].name))
                to_list = lists[key];
        }
        
        var ret = new IterableCollection(TrelloApi.post("lists/"+from_list.id+"/moveAllCards?idBoard="+to_list.idBoard+"&idList="+to_list.id));
        
        ret.transform(function(elem)
        {
            return new Card(elem);
        });
        
        return ret;
    }

    this.label = function(data)
    {
        return this.labels(data).first();
    }

    this.labels = function(data)
    {
        return this.iterableCollection("boards/"+this.data.id+"/labels?fields=id,name&limit=50",
                                       data,
                                       function(elem)
                                       {
                                           return new Label(elem);
                                       });
    }

    this.list = function(data)
    {
        return this.lists(data).first();
    }

    this.lists = function(data)
    {
        return this.iterableCollection("boards/"+this.data.id+"/lists?cards=none&card_fields=none&filter=open&fields=all",
                                       data,
                                       function(elem)
                                       {
                                           return new List(elem);
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

    this.cards = function(data)
    {
        var cards = new IterableCollection(TrelloApi.get("boards/"+this.data.id+"/cards?fields=id,name"));

        cards.transform(function(card)
        {
            return new Card(card);
        });
        
        if(data && data.name)
            cards.filterByName(data.name);
        
        return cards;
    }
}
