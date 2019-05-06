/**
* @class CustomField
* @memberof module:TrelloEntities
* @param data (Object} key/value pairs of 
* information, must at least contain "id",
* can basically just pass in response from Trello API
* @constructor
* @classdesc The CustomField class represents
* a CustomField in Trello. You will mostly interact
* with this class when returned in an IterableCollection
* from a Card method or as a result of a Notification
*/
var CustomField = function(data)
{
  this.data = data;
  this.containing_card = null;
  this.current_item = null;
  this.old_value = null;


    /**
    * Return the id of this comment
    * @memberof module:TrelloEntities.CustomField
    * @example
    * card.comments().first().id();
    */
    this.id = function()
    {
        if(!this.data)
            throw new Error("Malformed custom field object");
      
        return this.data.id;
    }

    /**
    * Return the value set for the
    * current card
    * @memberof module:TrelloEntities.CustomField
    */
    this.value = function()
    {
        return this.card().customFieldValue(this.name());
    }
    
    /**
    * Set the old value
    * @memberof module:TrelloEntities.CustomField
    */
    this.setOldValue = function(old)
    {
      this.old = old;
      return this;
    }
    
    /**
    * Return the old value
    * @memberof module:TrelloEntities.CustomField
    */
    this.oldValue = function()
    {      
      if(this.old)
      {
        this.card().customFields().each(function(loop)
                                        {
                                          if(loop.idCustomField == this.id())
                                          {                      
                                            if(this.old.idValue)
                                              loop.idValue = this.old.idValue;
                                            else
                                              loop.value = this.old.value;
                                            
                                            ret = this.card().extractCustomFieldValueFromDataBasedOnType(loop);
                                          }
                                        }.bind(this));
      }
      
      else
        var ret = this.value();
      
      return ret;
    }
    

    /**
    * Return the Card on which this comment
    * was added
    * @memberof module:TrelloEntities.CustomField
    * @example
    * var card = new Notification(posted).addedCustomField().card();
    */
    this.card = function()
    {
      return this.containing_card;
    }
    
    /**
    * Return the name of the custom field
    * @memberof module:TrelloEntities.CustomField
    * @example
    * card.comments().first().text();
    */
    this.name = function()
    {
        if(!this.data)
            throw new Error("Malformed custom field object");
      
        return this.data.name;
    }
    
    this.del = function()
    {
        throw "Implement me!";
    }
    
    //INTERNAL USE ONLY
    this.setContainingCard = function(card)
    {
      this.containing_card = card;
      return this;
    }

    //INTERNAL USE ONLY
    this.setItemForCurrentCard = function(item_data)
    {
        this.current_item = item_data;
        return this;
    }
}
