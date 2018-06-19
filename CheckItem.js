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
        return this.data.id;
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
        TrelloApi.del("cards/"+this.containing_checklist.card().data.id+"/checkItem/"+this.data.id);
        this.containing_checklist.check_items = null;
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
    * Change the state of this item to
    * either complete or incomplete
    * @memberof module:TrelloEntities.CheckItem
    * @param state {string} either complete or incomplete
    * @example
    * card.checklist("Something").items().first().mark("complete");
    */
    this.mark = function(state)
    {
      TrelloApi.put("cards/"+this.checklist().card().data.id+"/checkItem/"+this.data.id+"?state="+state);
      this.data.state = state;
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
        if(!this.data.text && !this.data.name)
            this.load();
        
      return (this.data.text)?this.data.text:this.data.name;
    }

    //INTERNAL USE ONLY
    this.load = function()
    {
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
        if(!this.data.state)
            this.load();
        
        return this.data.state;
    }
}
