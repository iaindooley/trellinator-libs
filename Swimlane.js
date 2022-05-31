/**
* @class Swimlane
* @memberof module:TrelloEntities
* @param data (Object} key/value pairs of 
* information, must at least contain "id",
* can basically just pass in response from WeKan API
* @constructor
* @classdesc The Swimlane class represents
* a Swimlane in WeKan. 
*
* You will mostly deal with this in an IterableCollection
* returned from methods in Card and Board.
*
* @example
* new Trellinator().board().labels().each(function(label)
* {
*     card.addSwimlane(label.name());
* });
*/
var Swimlane = function(data)
{    
    //allow Trello style IDs
    if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
        data['_id'] = data['_id'] || data.id;

    this.data  = data;
    this.containing_board  = null;

    /**
    * Return the id of this Swimlane
    * @memberof module:TrelloEntities.Swimlane
    * @example
    * card.label("Something").id();
    */
    this.id = function()
    {
        return Trellinator.standardId(this.data);
    }
    
    /**
    * Set the containing board that will be
    * returned from the card() method
    * @memberof module:TrelloEntities.Swimlane
    */
    this.setContainingBoard = function(board)
    {
        this.containing_board = board;
        return this;
    }

    /**
    * Return the board that this swimlane is on
    * @memberof module:TrelloEntities.Swimlane
    * @example
    * new Notification(posted).addedSwimlane()
    *                         .board().link()
    */
    this.board = function()
    {
        return this.containing_board;
    }
  
    /**
    * Return the name of this Swimlane
    * @memberof module:TrelloEntities.Swimlane
    * @example
    * card.labels().first().name();
    */
    this.name = function()
    {
        if(!('name' in this.data))
            this.load();

        return this.data.name;
    }

    /**
    * Remove this label
    * @memberof module:TrelloEntities.Swimlane
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
