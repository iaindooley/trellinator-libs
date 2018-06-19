/**
* @class Comment
* @memberof module:TrelloEntities
* @param data (Object} key/value pairs of 
* information, must at least contain "id",
* can basically just pass in response from Trello API
* @constructor
* @classdesc The Comment class represents
* a Comment in Trello. You will mostly interact
* with this class when returned in an IterableCollection
* from a Card method or as a result of a Notification
*
* @example
* var notif = new Notification(posted);
* 
* if(new RegExp("Remove.*").test(notif.addedComment().text()))
*     notif.card().removeMember(notif.member());
*/
var Comment = function(data)
{
    this.data = data;
    this.containing_card = null;

    /**
    * Return the id of this comment
    * @memberof module:TrelloEntities.Comment
    * @example
    * card.comments().first().id();
    */
    this.id = function()
    {
        return this.data.id;
    }

    /**
    * Return the Card on which this comment
    * was added
    * @memberof module:TrelloEntities.Comment
    * @example
    * var card = new Notification(posted).addedComment().card();
    */
    this.card = function()
    {
      return this.containing_card;
    }
    
    /**
    * Return the text of the comment
    * @memberof module:TrelloEntities.Comment
    * @example
    * card.comments().first().text();
    */
    this.text = function()
    {
        if(!this.data.data)
            throw new Error("Malformed comment object");

        return this.data.data.text;
    }

    /**
    * A name() function used in name comparisons
    * in the IterableCollection findByName method
    * @memberof module:TrelloEntities.Comment
    * @example
    * card.comments().findByName(new RegExp(".*search.*")).first().text();
    */
    this.name = function()
    {
        return this.text();
    }
    
    //INTERNAL USE ONLY
    this.setContainingCard = function(card)
    {
      this.containing_card = card;
      return this;
    }
}
