/**
* @class Comment
* @memberof module:TrelloEntities
* @constructor
*/
var Comment = function(data)
{
    this.data = data;
    this.containing_card = null;

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Comment
    * @example
    * new Notification(posted).board().id();
    */
    this.id = function()
    {
        return this.data.id;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Comment
    * @example
    * new Notification(posted).board().id();
    */
    this.card = function()
    {
      return this.containing_card;
    }
    
    /**
    * Ohai there
    * @memberof module:TrelloEntities.Comment
    * @example
    * new Notification(posted).board().id();
    */
    this.text = function()
    {
        if(!this.data.data)
            throw new Error("Malformed comment object");

        return this.data.data.text;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Comment
    * @example
    * new Notification(posted).board().id();
    */
    this.name = function()
    {
        return this.text();
    }
    
    /**
    * Ohai there
    * @memberof module:TrelloEntities.Comment
    * @example
    * new Notification(posted).board().id();
    */
    this.setContainingCard = function(card)
    {
      this.containing_card = card;
      return this;
    }
}
