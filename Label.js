/**
* @class Label
* @memberof module:TrelloEntities
* @param data (Object} key/value pairs of 
* information, must at least contain "id",
* can basically just pass in response from Trello API
* @constructor
* @classdesc The Label class represents
* a Label in Trello. 
*
* You will mostly deal with this in an IterableCollection
* returned from methods in Card and Board.
*
* @example
* new Trellinator().board().labels().each(function(label)
* {
*     card.addLabel(label.name());
* });
*/
var Label = function(data)
{    
    this.data  = data;
    this.containing_card  = null;

    /**
    * Return the id of this Label
    * @memberof module:TrelloEntities.Label
    * @example
    * card.label("Something").id();
    */
    this.id = function()
    {
        return this.data.id;
    }
    
    /**
    * Set the containing card that will be
    * returned from the card() method
    * @memberof module:TrelloEntities.Label
    */
    this.setContainingCard = function(card)
    {
        this.containing_card = card;
        return this;
    }

    /**
    * Return the card that this label is on
    * if any (usually returns null unless
    * this label was returned from a Notification
    * where a label was added to a card, or 
    * from a card.label() method)
    * @memberof module:TrelloEntities.Label
    * @example
    * new Notification(posted).addedLabel()
    *                         .card()
    *                         .postComment("Hi there!");
    */
    this.card = function()
    {
        return this.containing_card;
    }
  
    /**
    * Return the name of this Label
    * @memberof module:TrelloEntities.Label
    * @example
    * card.labels().first().name();
    */
    this.name = function()
    {
        if(typeof this.data.name == undefined)
            this.load();

        return this.data.name;
    }

    /**
    * Remove this label
    * @memberof module:TrelloEntities.Label
    * @example
    * card.labels().first().name();
    */
    this.del = function()
    {
        if(typeof this.data.name == undefined)
            this.load();

        TrelloApi.del("labels/"+this.data.id);
    }
    
    //INTERNAL USE ONLY
    this.load = function()
    {
        this.data = TrelloApi.get("labels/"+this.data.id+"?fields=all");
        return this;
    }
}
