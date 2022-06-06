/**
* @class Attachment
* @memberof module:TrelloEntities
* @param data (Object} key/value pairs of 
* information, must at least contain "id",
* can basically just pass in response from Trello API
* @constructor
* @classdesc The Attachmen class represents
* a card attachment in Trello.
* 
* You will mostly deal with lists in IterableCollections
* returned from Notification or Card methods.
*
* @example
* new Trellinator().attachedLink().name().url();
*/
var Attachment = function(data)
{    
    this.data         = data;
    this.name         = data.name || data.text || "";
    this.url          = data.url;
    this.card_object  = null;

    /**
    * Return the id of this Attachment
    * @memberof module:TrelloEntities.Attachment
    * @example
    * new Notification(posted).attachedLink().id();
    */
    this.id = function()
    {
        return this.data.id;
    }
  
    /**
    * Return the name of this Attachment
    * @memberof module:TrelloEntities.Attachment
    * @example
    * card.cardsLinkedInAttachments().first().name();
    */
    this.text = function()
    {
        if(
            !("name" in this.data) &&
            !("text" in this.data)
        )
            this.load();

        return this.data.name || this.data.text || "";
    }

    /**
    * Return the url of this Attachment
    * @memberof module:TrelloEntities.Attachment
    * @example
    * card.cardsLinkedInAttachments().first().url();
    */
    this.link = function()
    {
      if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
          var ret = this.data.url;
      else
      {
          if(!("url" in this.data))
            this.load();
          if((this.data.url.indexOf("https://trello") === 0) && (this.card_object) && (this.data.fileName))
          {
            var ret = "https://api.trello.com/1/cards/"+this.card_object.id()+"/attachments/"+this.data.id+"/download/"+this.data.fileName;
            var creds = TrelloApi.checkControlValues();
            ret = ret+"?key="+creds.key+"&token="+creds.token;
          }
          
          else if(this.data.url.indexOf("https://api.trello.com") === 0)
          {
            var creds = TrelloApi.checkControlValues();
            var ret = this.data.url+"?key="+creds.key+"&token="+creds.token;
          }
          
          else
            var ret = this.data.url;
      }
      
      return ret;
    }
    
    this.setContainingCard = function(card)
    {
        this.card_object = card;
        return this;
    }
    
    /**
    * Return the Card that contains this Attachment
    * @memberof module:TrelloEntities.Attachment
    * @example
    * new Notification(posted).attachedLink().card();
    */
    this.card = function()
    {
        return this.card_object;
    }

    /**
    * Set a new name for this Attachment
    * @memberof module:TrelloEntities.List
    * @example
    * new Notification(posted).attachedFile().setName("You attachmed me on "+Trellinator.now().toLocaleString());
    */
    this.setName = function(new_name)
    {
        throw new InvalidRequestException("Unable to set names on attachments until Iain gets a response from Trello support :)");
        return this;
    }
    
    /**
    * Remove this attachment from its containing card
    * and return the containing card
    * @memberof module:TrelloEntities.Attachment
    * @example
    * new Notification(notification).attachedLink().remove().postComment("You can't add links here!");
    */
    this.remove = function()
    {
        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
            WekanApi.del("boards/"+this.card().board().id()+"/cards/"+this.card().id()+"/checklists/"+this.card().checklist("Attachments").id()+"/items/"+this.id());
        else
            TrelloApi.del("cards/"+this.card_object.id()+"/attachments/"+this.id());

        return this.card_object;
    }
    
    /**
    * All attachments in Trello are links
    * @memberof module:TrelloEntities.List
    * @example
    * card.currentList().archive();
    */
    this.isLink = function()
    {
        return true;
    }
    
    /**
    * Is this link a board?
    * @memberof module:TrelloEntities.List
    * @example
    * card.currentList().archive();
    */
    this.isBoard = function()
    {
        return TrelloApi.boardLinkRegExp().test(this.data.url);
    }

    /**
    * Is this link a trello board?
    * @memberof module:TrelloEntities.List
    * @example
    * card.currentList().archive();
    */
    this.isCard = function()
    {
        return TrelloApi.cardLinkRegExp().test(this.data.url);
    }

    //DEPRECATED: all attachments are links
    this.isFile = function()
    {
        return !this.isLink();
    }

    //INTERNAL USE ONLY
    this.load = function()
    {
        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
            throw new InvalidRequestException("You can't load an Attachment object with the WeKan API, it should be loaded from a card");

        if(!this.card_object)
            throw new InvalidDataException("Unable to load attachment data without a containing card");

        this.data = TrelloApi.get("cards/"+this.card_object+"/attachments/"+this.data.id+"?fields=all");
        return this;
    }
}
