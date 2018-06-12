/**
* @class CheckItem
* @memberof module:TrelloEntities
* @constructor
*/
var CheckItem = function(data)
{
    this.data                 = data;
    this.containing_checklist = null;

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.id = function()
    {
        return this.data.id;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.remove = function()
    {
        TrelloApi.del("cards/"+this.containing_checklist.card().data.id+"/checkItem/"+this.data.id);
        return this.containing_checklist;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.checklist = function()
    {
        return this.containing_checklist;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.setContainingChecklist = function(checklist)
    {
        this.containing_checklist = checklist;
        return this;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.setName = function(name)
    {
        TrelloApi.put("cards/"+this.containing_checklist.card().data.id+"/checkItem/"+this.data.id+"?name="+encodeURIComponent(name));
        return this;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.url = function()
    {
        if(!this.data.url)
            this.load();
        
        return this.data.url;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.mark = function(state)
    {
      TrelloApi.put("cards/"+this.checklist().card().data.id+"/checkItem/"+this.data.id+"?state="+state);
      return this;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.state = function()
    {
        if(!this.data.state)
            this.load();
        
        return this.data.state;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.name = function()
    {
        if(!this.data.text && !this.data.name)
            this.load();
        
      return (this.data.text)?this.data.text:this.data.name;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.load = function()
    {
        this.data = TrelloApi.get("checklists/"+this.containing_checklist.data.id+"/checkitems/"+this.data.id+"?fields=all");
        return this;
    }
}
