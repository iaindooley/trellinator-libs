/**
* @class Checklist
* @param data (Object} key/value pairs of 
* information, must at least contain "id",
* can basically just pass in response from Trello API
* @memberof module:TrelloEntities
* @constructor
* @classdesc The Checklist class represents
* a Checklist in Trello. You will typically interact
* with the Checklist object as the return value
* of methods on the Card object.
*
* @example
* card.checklist("Something").items().each(function(item)
* {
*     card.postComment(item.name()+" is "+item.state());
* });
* @example
* card.addChecklist("New List",function(cl)
* {
*     cl.addItem("New Item");
* });
*/
var Checklist = function(data)
{
    //allow Trello style IDs
    if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
        data['_id'] = data['_id'] || data.id;

    this.data            = data;
    this.item_list       = null;
    this.containing_card = null;

    /**
    * Return the id of this checklist
    * @memberof module:TrelloEntities.Checklist
    * @example
    * card.checklist("Something").id();
    */
    this.id = function()
    {
        return Trellinator.standardId(this.data);
    }
  
    /**
    * Set the name of this checklist
    * @memberof module:TrelloEntities.Checklist
    * @param name {string} the new name for the checklist
    * @example
    * card.checklist("Old Name").setName("New Name");
    */
    this.setName = function(name)
    {
        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
            throw new InvalidRequestException("Cannot setName on a Checklist with the WeKan API yet");
        else
            TrelloApi.put("checklists/"+this.data.id+"/name?value="+encodeURIComponent(name));

        this.data.name = name;
        this.data.title = name;
        return this;
    }

    /**
    * Set the position of this checklist
    * @memberof module:TrelloEntities.Checklist
    * @param position {string|number} either top, bottom or a positive number
    * @example
    * card.checklist("My Checklist").setPosition("top");
    */
    this.setPosition = function(position)
    {
      if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
            throw new InvalidRequestException("Cannot setPosition on a Checklist with the WeKan API yet");
      else
          TrelloApi.put("checklists/"+this.data.id+"?pos="+encodeURIComponent(position));

      this.data.pos = position;
      return this;
    }

    /**
    * Delete all items matching the given state
    * @memberof module:TrelloEntities.Checklist
    * @param state {string} either complete or incomplete
    * @example
    * card.checklist("Something").deleteItems("complete");
    */
    this.deleteItems = function(state)
    {
        this.items().each(function(elem)
        {   
            if(
               (elem.state() == state) ||
               !state
              )
            {
                if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
                    WekanApi.del("boards/"+this.card().board().id()+"/cards/"+this.card().id()+"/checklists/"+this.id()+"/items/"+elem.id());
                else
                    TrelloApi.del("cards/"+this.card().id()+"/checkItem/"+elem.data.id);
            }
        }.bind(this));
        this.item_list = null;
        return this;
    }

    /**
    * Mark all items incomplete
    * @memberof module:TrelloEntities.Checklist
    * @example
    * card.checklist("Something").reset();
    */
    this.reset = function()
    {
        this.items().each(function(elem)
        {   
            if(elem.state() == "complete")
            {
                if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
                    elem.markIncomplete();
                else
                    TrelloApi.put("cards/"+this.card().data.id+"/checkItem/"+elem.data.id+"?state=incomplete");
            }
        }.bind(this));
        this.item_list = null;
        return this;
    }
    
    /**
    * Remove this checklist from the containing card
    * @memberof module:TrelloEntities.Checklist
    * @example
    * card.checklist("Something").remove();
    */
    this.remove = function()
    {
        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
            WekanApi.del("boards/"+this.card().board().id()+"/cards/"+this.card().id()+"/checklists/"+this.id());
        else
            TrelloApi.del("cards/"+this.card().id()+"/checklists/"+this.id());

        this.card().checklist_list = null;
        return this.card();
    }

    /**
    * Mark all items complete
    * @memberof module:TrelloEntities.Checklist
    * @example
    * card.checklist("Something").markAllItemsComplete();
    */
    this.markAllItemsComplete = function()
    {
      this.items().each(function(elem)
                        {   
                          if(elem.state() == "incomplete")
                          {
                              if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
                                  elem.markComplete();
                              else
                                  TrelloApi.put("cards/"+this.card().id()+"/checkItem/"+elem.id()+"?state=complete");
                          }
                        }.bind(this));
      
      this.item_list = null;
      return this;
    }

    /**
    * Convert this checklist into a list of links 
    * to newly created cards in the given list, with
    * each card being named after the original checklist
    * item and each checklist item being linked to the
    * newly created card. Each newly created card
    * has a link to the source card in the description.
    * @memberof module:TrelloEntities.Checklist
    * @param list {List} the list in which to create the new cards
    * @param params {Object} (optional) an optional set of key/value
    * pairs in an Object to use when creating the cards, the list
    * of allowed attributes is at {@link https://developers.trello.com/reference/#cards-2}
    * @example
    * //Convert into linked cards with each card having 
    * //the same labels and members as the original card
    * var member_ids = card.members().find(function(member)
    * {
    *     return member.id();
    * }).implodeValues(",");
    * var label_ids = card.labels().find(function(label)
    * {
    *     return label.id();
    * }).implodeValues(",");
    * card.checklist("Something")
    * .convertIntoLinkedCards(card.board().findOrCreateList(card.name()+" Linked Cards"),
    *                         {idLabels: label_ids,
    *                          idMembers: member_ids});
    */
    this.convertIntoLinkedCards = function(list,params)
    {
        if(!params)
            params = {};

        params.desc = this.card().link();

        this.items().each(function(item)
        {
            params.name = item.name();
            item.setName(Card.create(list,params).link());
        }.bind(this));
        this.item_list = null;
        return this;
    }

    /**
    * Return true if all items in this checklist 
    * are complete
    * @memberof module:TrelloEntities.Checklist
    * @example
    * if(card.checklist("Something").isComplete())
    *     card.postComment("Something is complete");
    */
    this.isComplete = function()
    {
        var ret = true;

        this.items().each(function(elem)
        {
            if(elem.state() == "incomplete")
                ret = false;
        });
            
        return ret;
    }

    /**
    * Return the card that this checklist is on
    * @memberof module:TrelloEntities.Checklist
    * @example
    * new Notification(posted).completedChecklist().card().postComment("Well done!");
    */
    this.card = function()
    {
        return this.containing_card;
    }

    /**
    * Return the name of this checklist
    * @memberof module:TrelloEntities.Checklist
    * @example
    * card.postComment(new Notification(posted).completedChecklist().name()+" was completed");
    */
    this.name = function()
    {
        if(!this.data.name && !this.data.text && !this.data.title)
            this.load();
        
        return this.data.name || this.data.text || this.data.title;
    }

    /**
    * Add an item to this checklist if an item with the
    * same name does not already exist
    * @memberof module:TrelloEntities.Checklist
    * @param name {string} the name for the checklist item
    * @param position {int} (optional) where to add the item
    * @example
    * card.addChecklist("Some List",function(list)
    * {
    *     list.addUniqueItem(card.link());
    * });
    */
    this.addUniqueItem = function(name,position,checked)
    {
        try
        {
            var existing = this.items().findByName(name).first();
            
            if(checked)
                existing.markComplete();
        }
        
        catch(e)
        {
            Notification.expectException(InvalidDataException,e);
            this.addItem(name,position,checked);
        }
        
        return this;
    }

    /**
    * Add an item to this checklist, even if it 
    * already exists
    * @memberof module:TrelloEntities.Checklist
    * @param name {string} the name for the checklist item
    * @param position {int} (optional) where to add the item
    * @example
    * card.addChecklist("Some List",function(list)
    * {
    *     list.addItem(card.link());
    * });
    */
    this.addItem = function(name,position,checked)
    {
        if(!position)
            position = "bottom";

        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
        {
            var items_to_set = [];
            
            this.items().each(function(item)
            {
                items_to_set.push(item);

            }.bind(this));

            items_to_set.push(
                new CheckItem(
                    {
                        "title": name,
                        "sort": position,
                        "isFinished": checked,
                        "checklistId": this.id(),
                        "cardId": this.card().id(),
                        "createdAt": new Date(),
                        "modifiedAt": new Date()
                    }
                )
            );

            this.setItems(items_to_set);
        }

        else
            new CheckItem(TrelloApi.post("checklists/"+this.data.id+"/checkItems?name="+encodeURIComponent(name)+"&pos="+encodeURIComponent(position))+"&checked="+checked).setContainingChecklist(this);

        this.item_list = null;
        return this;
    }
    
    /**
    * Set items on this checklist by first removing and then re-adding
    * with a bunch of items, temporary hack due to lack of ability to 
    * add an item to a checklist in the WeKan API
    * or RegExp
    * @memberof module:TrelloEntities.Checklist
    * @param name {string|RegExp} the name or regex to match against the
    * item name
    * @example
    * card.checklist("Something").item(new RegExp("Iain's.*")).markComplete();
    */
    this.setItems = function(items)
    {
        var name = this.name();
        var curcard = this.remove();

        curcard.addChecklist(
            {
                title: name,
                items: new IterableCollection(items).find(function(item)
                {
                    return item.name();
                }).asArray()
            },
            function(cl)
            {
                this.data = cl.data;
                this.containing_card = curcard;
                this.item_list = null;
            }.bind(this)
        );
        
        new IterableCollection(items).each(function(item)
        {
            if(item.isComplete())
                this.item(item.name()).markComplete();

        }.bind(this));
    }
    
    /**
    * Return an item from this checklist by name
    * or RegExp
    * @memberof module:TrelloEntities.Checklist
    * @param name {string|RegExp} the name or regex to match against the
    * item name
    * @example
    * card.checklist("Something").item(new RegExp("Iain's.*")).markComplete();
    */
    this.item = function(name)
    {
        return this.items(name).first();
    }

    /**
    * Return an IterableCollection of checklist items
    * optionally filered by name or RegExp
    * @memberof module:TrelloEntities.Checklist
    * @param name {string|RegExp} filter the list by string or RegExp
    * @example
    * card.checklist("Something").items(new RegExp("Iain's.*")).each(function(item)
    * {
    *     item.remove();
    * });
    */
    this.items = function(name)
    {
        if(!this.item_list)
        {
            if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
            {
                if(!this.data.items)
                    this.load();

                this.item_list = new IterableCollection(this.data.items).transform(function(item)
                {
                    return new CheckItem(item).setContainingChecklist(this);
                }.bind(this));
            }
            
            else
            {
                this.item_list = new IterableCollection(TrelloApi.get("checklists/"+this.data.id+"/checkItems")).transform(function(item)
                {
                    return new CheckItem(item).setContainingChecklist(this);
                }.bind(this));
            }
        }

        return this.item_list.findByName(name);
    }
    
    //INTERNAL USE ONLY
    this.load = function()
    {
        this.item_list = null;

        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
            this.data = WekanApi.get("boards/"+this.card().board().id()+"/cards/"+this.card().id()+"/checklists/"+this.id());
        else
            this.data = TrelloApi.get("checklists/"+this.data.id+"?cards=all&checkItems=all&checkItem_fields=all&fields=all");
      
        if(!this.data)
            throw new InvalidDataException("We appear to not exist ... ");
      
        return this;
    }

    //INTERNAL USE ONLY
    this.setContainingCard = function(card)
    {
        this.containing_card = card;
        return this;
    }
}
