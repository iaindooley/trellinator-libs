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
    
    //INTERNAL USE ONLY
    this.load = function()
    {
        this.data = TrelloApi.get("labels/"+this.data.id+"?fields=all");
        return this;
    }
}
