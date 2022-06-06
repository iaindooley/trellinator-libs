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
    //allow Trello style IDs
    if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
        data['_id'] = data['_id'] || data.id;

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
        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
            return this.data['_id'];
        else if(!this.data.data)
            throw new Error("Malformed comment object");

        return this.data.data.id || this.data.id;
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
        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
        {
            if(!("comment" in this.data))
                this.load();
            
            return this.data.comment;
        }

        if(!this.data.data)
            throw new Error("Malformed comment object");

        return this.data.data.text;
    }
    
    /**
    * Return the member who made a comment
    * @memberof module:TrelloEntities.Comment
    * @example
    * card.comments().first().member();
    */
    this.member = function()
    {
      if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
          return new Member({id: this.data.authorId});
      else
          return new Member(this.data.memberCreator);
    }
    
    /**
    * Return an IterableCollection of mentioned members
    * @memberof module:TrelloEntities.Comment
    * @example
    * card.comments().first().mentionedMembers();
    */
    this.mentionedMembers = function()
    {
        var ret     = new Array();

        this.card().board().members().each(function(member)
        {
            if(new RegExp(".*@"+member.name()+".*").test(this.text()))
                ret.push(member);
        });
        
        if(!ret.length)
            throw new InvalidActionException("No members were mentioned in this comment");
        
        return new IterableCollection(ret);
    }
    
    /**
    * Return a Date when this comment was made
    * @memberof module:TrelloEntities.Comment
    * @example
    * card.comments().first().when().toString();
    */
    this.when = function()
    {
        if(
            !("date" in this.data) &&
            !("createdAt" in this.data)
        )
            this.load();

        return new Date(this.data.date || this.data.createdAt || new Date());
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
    
    /**
    * Delete this comment, works only if you have 
    * more permissions than the person who made the
    * comment, you made the comment or the person
    * who made the comment has deleted their account
    * Returns the containing card
    * @memberof module:TrelloEntities.Comment
    * @example
    * card.comments().first().del();
    */
    this.del = function()
    {
        TrelloApi.del("actions/"+this.id());
        return this.card();
    }

    /**
    * Edit this comment, works only if you have 
    * more permissions than the person who made the
    * comment, you made the comment or the person
    * who made the comment has deleted their account
    * Returns the containing card
    * @memberof module:TrelloEntities.Comment
    * @example
    * card.comments().first().del();
    */
    this.setText = function(text)
    {
        TrelloApi.put("actions/"+this.id()+"/text?value="+encodeURIComponent(text));
        return this.card();
    }
    
    //INTERNAL USE ONLY
    this.setContainingCard = function(card)
    {
      this.containing_card = card;
      return this;
    }
    
    this.load = function()
    {
        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
            this.data = WekanApi.get("boards/"+this.card().board().id()+"/cards/"+this.card().id()+"/comments/"+this.id());
        else
            throw new InvalidRequestException("Only know how to load Comment using WeKan API");
    }
}
