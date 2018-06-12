/**
* @class Label
* @memberof module:TrelloEntities
* @constructor
*/
var Label = function(data)
{    
    this.data  = data;

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Label
    * @example
    * new Notification(posted).board().id();
    */
    this.id = function()
    {
        return this.data.id;
    }
  
    /**
    * Ohai there
    * @memberof module:TrelloEntities.Label
    * @example
    * new Notification(posted).board().id();
    */
    this.name = function()
    {
        if(typeof this.data.name == undefined)
            this.load();

        return this.data.name;
    }
    
    /**
    * Ohai there
    * @memberof module:TrelloEntities.Label
    * @example
    * new Notification(posted).board().id();
    */
    this.load = function()
    {
        this.data = TrelloApi.get("labels/"+this.data.id+"?fields=all");
        return this;
    }
}
