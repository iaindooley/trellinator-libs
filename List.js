var List = function(data)
{    
    this.data      = data;
    this.card_list = null;

    this.id = function()
    {
        return this.data.id;
    }
  
    this.move = function(board)
    {
        TrelloApi.put("lists/"+this.data.id+"/idBoard?value="+board.data.id);
        return this;
    }

    this.name = function()
    {
        if(!this.data.name && !this.data.text)
            this.load();

        return this.data.name ? this.data.name:this.data.text;
    }
    
    this.board = function(filter)
    {
        if(!this.data.idBoard)
            this.load();
        
        return new Board({id: this.data.idBoard});
    }

    this.card = function(filter)
    {
        return this.cards(filter).first();
    }

    this.cards = function(filter)
    {
        if(!this.card_list)
        {
            this.card_list = new IterableCollection(TrelloApi.get("lists/"+this.data.id+"/cards?fields=id,name")).transform(function(elem)
            {
                return new Card(elem);
            });
        }

        return this.card_list.findByName(filter);
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
    
    this.archive = function()
    {
        TrelloApi.put("lists/"+this.data.id+"?closed=true");
    }

    this.load = function()
    {
        this.card_list = null;
        this.data = TrelloApi.get("lists/"+this.data.id+"?fields=all");
        return this;
    }
}
