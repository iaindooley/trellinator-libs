/**
* @class List
* @memberof module:TrelloEntities
* @param data (Object} key/value pairs of 
* information, must at least contain "id",
* can basically just pass in response from Trello API
* @constructor
* @classdesc The List class represents
* a List in Trello. 
* 
* You will mostly deal with lists in IterableCollections
* returned from Board methods.
*
* @example
* new Trellinator().board("Some board").findOrCreateList("ToDo");
* @example
* new Trellinator().board("Some board").list("ToDo").cards().first().postComment("Me first!");
* @example
* new Trellinator().board("Some Board").lists().each(function(list)
* {
*     list.cards().first().postComment("Me first!");
* });
*/
var List = function(data)
{    
    this.data         = data;
    this.card_list    = null;
    this.board_object = null;

    /**
    * Return the id of this List
    * @memberof module:TrelloEntities.List
    * @example
    * board.list("Some List").id();
    */
    this.id = function()
    {
        return this.data.id;
    }
  
    /**
    * Move a list to a different board
    * @memberof module:TrelloEntities.List
    * @param board {Board} the board to move this list to
    * @example
    * var to_board = new Trellinator().board("Some Board");
    * new Notification(posted).addedCard().currentList().move(to_board);
    */
    this.move = function(board)
    {
        TrelloApi.put("lists/"+this.data.id+"/idBoard?value="+board.id());
        this.data.idBoard = null;
        this.board_object = null;
        return this;
    }

    /**
    * Return the name of this List
    * @memberof module:TrelloEntities.List
    * @example
    * card.currentList().name();
    */
    this.name = function()
    {
        if(!this.data.name && !this.data.text)
            this.load();

        return this.data.name ? this.data.name:this.data.text;
    }
    
    /**
    * Return the board that contains this list
    * @memberof module:TrelloEntities.List
    * @example
    * card.currentList().board();
    */
    this.board = function()
    {
        if(!this.data.idBoard && !this.board_object)
            this.load();
        
        if(!this.board_object && this.data.idBoard)
            this.board_object = new Board({id: this.data.idBoard});

        if(!this.board_object)
            throw new InvalidDataException("List is not in a board: "+this.id());

        return this.board_object;
    }
    
    this.setBoard = function(board)
    {
        this.board_object = board;
        return this;
    }

    /**
    * Return a Card from this list, filtered by
    * name or regex
    * @memberof module:TrelloEntities.List
    * @param name {string|RegExp} a string or RegEx to match against the name
    * of the cards, if multiple match the first will be returned
    * @example
    * card.currentList().card("Another Card");
    * @example
    * card.currentList().card(new RegExp("Process.*"));
    */
    this.card = function(name)
    {
        return this.cards(name).first();
    }

    /**
    * Return an IterableCollection of cards in this
    * list, optionally filtered by name using a 
    * string or regex
    * @memberof module:TrelloEntities.List
    * @param name {string|RegExp} a string or regex to match against
    * the names of cards in this list
    * @example
    * card.currentList().cards(new RegExp(card.name()+".*")).each(function(loop)
    * {
    *     if(loop.id() != card.id())
    *         loop.postComment("Twinsies!");
    * });
    */
    this.cards = function(name)
    {
        if(!this.card_list)
        {
            this.card_list = new IterableCollection(TrelloApi.get("lists/"+this.data.id+"/cards?fields=id,name")).transform(function(elem)
            {
                return new Card(elem).setCurrentList(this);
            }.bind(this));
        }

        return this.card_list.findByName(name);
    }

    /**
    * Return the number of cards in this list
    * @memberof module:TrelloEntities.List
    * @example
    * card.currentList().countCards();
    */
    this.countCards = function()
    {
        return this.cards().length();
    }
    
    /**
    * Set a new name for this list
    * @memberof module:TrelloEntities.List
    * @example
    * card.currentList().setName("I have "+card.name());
    */
    this.setName = function(new_name)
    {
        this.rename(new_name);
    }
    
    /**
    * Archive this list
    * @memberof module:TrelloEntities.List
    * @example
    * card.currentList().archive();
    */
    this.archive = function()
    {
        TrelloApi.put("lists/"+this.data.id+"?closed=true");
        return this;
    }

    /**
    * Unarchive this list
    * @memberof module:TrelloEntities.List
    * @example
    * card.currentList().unArchive();
    */
    this.unArchive = function()
    {
        TrelloApi.put("lists/"+this.data.id+"?closed=false");
        return this;
    }

    /**
    * Copy this list
    * @memberof module:TrelloEntities.List
    * @example
    * var notif = new Notification(posted);
    * notif.board().copy();
    */
    this.copy = function(pos)
    {
      if(!pos)
        pos = "top";
      
      return new List(TrelloApi.post("lists?name="+encodeURIComponent(this.name())+"&idBoard="+this.board().id()+"&idListSource="+this.id()+"&pos="+pos));
    }

    /**
    * Move all cards from this list to another
    * @memberof module:TrelloEntities.List
    * @param to_list {List} a List object to move all cards to
    * @example
    * var notif = new Notification(posted);
    * var from_list = notif.board().list("Start");
    * var to_list = new Trellinator().board("Another").list("Finish");
    * from_list.moveAllCards(to_list);
    */
    this.moveAllCards = function(to_list)
    {
        new IterableCollection(TrelloApi.post("lists/"+this.id()+"/moveAllCards?idBoard="+to_list.board().id()+"&idList="+to_list.id()));
        this.card_list = null;
        to_list.card_list = null;
        return this;
    }

    //INTERNAL USE ONLY
    this.load = function()
    {
        this.card_list = null;
        this.board_object = null;
        this.data = TrelloApi.get("lists/"+this.data.id+"?fields=all");
        return this;
    }

    //DEPRECATED used setName
    this.rename = function(new_name)
    {
        var updated = TrelloApi.put("lists/"+this.data.id+"/name?value="+encodeURIComponent(new_name));
        this.data.name = new_name;
        return this;
    }
}
