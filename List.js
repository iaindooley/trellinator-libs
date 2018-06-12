/**
* @class List
* @memberof module:TrelloEntities
* @constructor
*/
var List = function(data)
{    
    this.data      = data;
    this.card_list = null;

    /**
    * Ohai there
    * @memberof module:TrelloEntities.List
    * @example
    * new Notification(posted).board().id();
    */
    this.id = function()
    {
        return this.data.id;
    }
  
    /**
    * Ohai there
    * @memberof module:TrelloEntities.List
    * @example
    * new Notification(posted).board().id();
    */
    this.move = function(board)
    {
        TrelloApi.put("lists/"+this.data.id+"/idBoard?value="+board.data.id);
        return this;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.List
    * @example
    * new Notification(posted).board().id();
    */
    this.name = function()
    {
        if(!this.data.name && !this.data.text)
            this.load();

        return this.data.name ? this.data.name:this.data.text;
    }
    
    /**
    * Ohai there
    * @memberof module:TrelloEntities.List
    * @example
    * new Notification(posted).board().id();
    */
    this.board = function(filter)
    {
        if(!this.data.idBoard)
            this.load();
        
        return new Board({id: this.data.idBoard});
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.List
    * @example
    * new Notification(posted).board().id();
    */
    this.card = function(filter)
    {
        return this.cards(filter).first();
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.List
    * @example
    * new Notification(posted).board().id();
    */
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

    /**
    * Ohai there
    * @memberof module:TrelloEntities.List
    * @example
    * new Notification(posted).board().id();
    */
    this.countCards = function(params)
    {
        return this.cards().length();
    }
    
    /**
    * Ohai there
    * @memberof module:TrelloEntities.List
    * @example
    * new Notification(posted).board().id();
    */
    this.rename = function(new_name)
    {
        var updated = TrelloApi.put("lists/"+this.data.id+"/name?value="+encodeURIComponent(new_name));
        this.data.name = updated.name;
        return updated;
    }
    
    /**
    * Ohai there
    * @memberof module:TrelloEntities.List
    * @example
    * new Notification(posted).board().id();
    */
    this.archive = function()
    {
        TrelloApi.put("lists/"+this.data.id+"?closed=true");
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.List
    * @example
    * new Notification(posted).board().id();
    */
    this.load = function()
    {
        this.card_list = null;
        this.data = TrelloApi.get("lists/"+this.data.id+"?fields=all");
        return this;
    }
}
