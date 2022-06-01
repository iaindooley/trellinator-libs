/**
* @class CheckItem
* @memberof module:TrelloEntities
* @param data (Object} key/value pairs of 
* information, must at least contain "id",
* can basically just pass in response from Trello API
* @constructor
* @classdesc The CheckItem class represents
* a checklist item in Trello. 
*
* You will typically only interact with this class
* as a return value in an IterableCollection from
* a checklist.
*
* @example
* card.checklist("Something").item(new RegExp("Process.*")).remove();
* @example
* card.checklist("Something").item(new RegExp("Process.*")).mark("complete");
* @example
* card.checklist("Something").items().each(function(item)
* {
*     if(new RegExp("Start.*").test(item.name()))
*         item.remove();
* });
*/
var CheckItem = function(data)
{
    //allow Trello style IDs
    if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
        data['_id'] = data['_id'] || data.id;

    this.data                 = data;
    this.containing_checklist = null;

    /**
    * Return the id of this item
    * @memberof module:TrelloEntities.CheckItem
    * @example
    * card.checklist("Something").item("Blah").id();
    */
    this.id = function()
    {
        return Trellinator.standardId(this.data);
    }

    /**
    * Remove this item from it's containing checklist
    * and return the checklist
    * @memberof module:TrelloEntities.CheckItem
    * @example
    * card.checklist("Something").item("Blah").remove();
    */
    this.remove = function()
    {
        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
            WekanApi.del("boards/"+this.checklist().card().board().id()+"/cards/"+this.checklist().card().id()+"/checklists/"+this.checklist().id()+"/items/"+this.id());
        else
            TrelloApi.del("cards/"+this.containing_checklist.card().data.id+"/checkItem/"+this.data.id);

        this.containing_checklist.item_list = null;
        return this.containing_checklist;
    }

    /**
    * Return the containing Checklist
    * @memberof module:TrelloEntities.CheckItem
    * @example
    * card.checklist("Something").item("Blah").checklist().item("Blah");//AARRGH!
    */
    this.checklist = function()
    {
        return this.containing_checklist;
    }

    /**
    * Set the text for this item (ie. it's name)
    * @memberof module:TrelloEntities.CheckItem
    * @param name {string} the text to appear for the checklist item
    * @example
    * card.checklist("Something").items().first().setName("Blah");
    */
    this.setName = function(name)
    {
        TrelloApi.put("cards/"+this.containing_checklist.card().data.id+"/checkItem/"+this.data.id+"?name="+encodeURIComponent(name));
        this.data.name = name;
        return this;
    }

    /**
    * Set the position for this item
    * @memberof module:TrelloEntities.CheckItem
    * @param pos {string|int} either top, bottom or a positive number
    * @example
    * card.checklist("Something").items().first().setPosition("top");
    */
    this.setPosition = function(pos)
    {
        TrelloApi.put("cards/"+this.containing_checklist.card().data.id+"/checkItem/"+this.data.id+"?pos="+encodeURIComponent(pos));
        this.data.pos = pos;
        return this;
    }

    /**
    * Change the state of this item to
    * complete
    * @memberof module:TrelloEntities.CheckItem
    * @example
    * card.checklist("Something").items().first().markComplete();
    */
    this.markComplete = function()
    {
        this.mark("complete");
        return this;
    }

    /**
    * Change the state of this item to
    * incomplete
    * @memberof module:TrelloEntities.CheckItem
    * @example
    * card.checklist("Something").items().first().markIncomplete();
    */
    this.markIncomplete = function()
    {
        this.mark("incomplete");
        return this;
    }

    /**
    * Return true of this is complete
    * @memberof module:TrelloEntities.CheckItem
    * @example
    * if(card.checklist("Something").items().first().isComplete())
    *     card.postComment("The first item in the Something checklist is complete");
    */
    this.isComplete = function()
    {
        return this.state() == "complete";
    }

    /**
    * Return the name (ie. full text) for this item
    * @memberof module:TrelloEntities.CheckItem
    * @example
    * card.checklist("Something").items().first().name();
    */
    this.name = function()
    {
        if(!this.data.text && !this.data.name && !this.data.title)
            this.load();
        
      return this.data.text || this.data.name || this.data.title;
    }
    
    /**
    * Return a Card object that is linked in the name of this
    * checklist item. If more than one card is linked, just
    * returns the first one. Ignores any other text or formatting
    * @memberof module:TrelloEntities.CheckItem
    * @example
    * card.checklist("Something").items().first().linkedCard().name();
    */
    this.linkedCard = function()
    {
      if(parts = TrelloApi.cardLinkRegExp().exec(this.name()))
      {
          return new Card({id: parts[1]});
      }
      
      else
      {
          throw new InvalidDataException("No card linked in checklist item name");
      }
    }

    /**
    * Return a Board object that is linked in the name of this
    * checklist item. If more than one board is linked, just
    * returns the first one. Ignores any other text or formatting
    * @memberof module:TrelloEntities.CheckItem
    * @example
    * card.checklist("Something").items().first().linkedBoard().name();
    */
    this.linkedBoard = function()
    {
      if(parts = TrelloApi.boardLinkRegExp().exec(this.name()))
      {
          return new Board({id: parts[1]});
      }
      
      else
      {
          throw new InvalidDataException("No board linked in checklist item name");
      }
    }

    //INTERNAL USE ONLY
    this.load = function()
    {
        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
            this.data = WekanApi.get("boards/"+this.checklist().card().board().id()+"/cards/"+this.checklist().card().id()+"/checklists/"+this.checklist().id()+"/items/"+this.id());
        else
            this.data = TrelloApi.get("checklists/"+this.containing_checklist.data.id+"/checkitems/"+this.data.id+"?fields=all");

        return this;
    }

    //INTERNAL USE ONLY
    this.setContainingChecklist = function(checklist)
    {
        this.containing_checklist = checklist;
        return this;
    }

    //DEPRECATED
    this.url = function()
    {
        if(!this.data.url)
            this.load();
        
        return this.data.url;
    }

    //DEPRECATED: use isComplete
    this.state = function()
    {
        if(!this.data.state && !("isFinished" in this.data))
            this.load();
        
        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
        {
            if(this.data.isFinished)
                this.data.state = "complete";
            else
                this.data.state = "incomplete";
        }
        
        return this.data.state;
    }

    //INTERNAL USE ONLY
    this.mark = function(state)
    {
        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
        {
            var data = {};

            if(state == "complete")
                data.isFinished = "true";
            else
                data.isFinished = "false";

            WekanApi.put("boards/"+this.checklist().card().board().id()+"/cards/"+this.checklist().card().id()+"/checklists/"+this.checklist().id()+"/items/"+this.id(),data);
        }

        else
            TrelloApi.put("cards/"+this.checklist().card().data.id+"/checkItem/"+this.data.id+"?state="+state);

        this.data.state = state;
        return this;
    }
}
