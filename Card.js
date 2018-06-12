/**
* @class Card
* @memberof module:TrelloEntities
* @constructor
*/
var Card = function(data)
{    
    this.data            = data;
    this.checklist_list  = null;
    this.labels_list     = null;
    this.members_list    = null;

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.id = function()
    {
        return this.data.id;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.removeChecklistItemByName = function(name)
    {
        this.checklists().each(function(list)
        {   
            list.items().each(function(item)
            {   
                if(TrelloApi.nameTest(name,item.name()))
                    item.remove();
            });
        });
        
        return this;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.dueComplete = function()
    {
        if(typeof this.data.dueComplete == "undefined")
            this.load();

        return this.data.dueComplete;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.board = function()
    {
        if(!this.data.idBoard && !this.data.board)
            this.load();
        
        var data = (this.data.board) ? this.data.board:this.data.idBoard;
        return new Board(data);
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.comments = function(limit)
    {
        if(!limit)
            limit = 20;

        return new IterableCollection(TrelloApi.get("cards/"+this.data.id+"/actions?filter=commentCard&limit="+limit))
                                               .transform(function(elem)
        {
            return new Comment(elem);
        });
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.moveToNextList = function()
    {
        this.moveTo({list: this.board().lists().itemAfter(this.currentList().name()).name(),position: "top"});
        return this;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.currentList = function()
    {
        if(!this.data.list)
            this.load();
        
        return new List(this.data.list);
    }
    
    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.allChecklistsComplete = function()
    {
        var ret = true;

        this.checklists().each(function(checklist)
        {   
            checklist.items().each(function(item)
            {   
                if(item.state == "incomplete")
                    ret = false;
            }.bind(this));
        }.bind(this));        
        
        return ret;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.cardsLinkedInAttachments = function()
    {
        return this.attachments(TrelloApi.cardLinkRegExp()).transform(function(elem)
        {
            if(TrelloApi.cardLinkRegExp().test(elem.url))
                return new Card({link: elem.url});
            else
                return false;
        });
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.boardsLinkedInAttachments = function()
    {
        return this.attachments(TrelloApi.boardLinkRegExp()).transform(function(elem)
        {
            if(TrelloApi.boardLinkRegExp().test(elem.url))
                return new Board({link: elem.url});
            else
                return false;
        });
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.attachment = function(name)
    {
        return this.attachments(name).first();
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.attachments = function(name)
    {
        if(!this.data.attachments)
            this.load();

        return new IterableCollection(this.data.attachments);
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.link = function()
    {
        if(!this.data.shortLink)
            this.load();
        
        return "https://trello.com/c/"+this.data.shortLink;
    }
    
    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.attachLink = function(data)
    {
        if(data.url)
            var link = data.url;
        else if(typeof data.link == "string")
            var link = data.link;
        else
            var link = data;

        var url = "cards/"+this.data.id+"/attachments?url="+encodeURIComponent(link);

        if(data.name)
            url += "&name="+encodeURIComponent(data.name);

        TrelloApi.post(url);
        return this;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.setName = function(name)
    {
        TrelloApi.put("cards/"+this.data.id+"?name="+encodeURIComponent(name));
        return this;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.name = function()
    {
        if(!this.data.name && !this.data.text)
            this.load();

        return this.data.name ? this.data.name:this.data.text;
    }
    
    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.addMember = function(member)
    {
        TrelloApi.post("cards/"+this.data.id+"/idMembers?value="+member.data.id);
        return this;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.member = function(data)
    {
        return this.members(data).first();
    }
    
    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.members = function(data)
    {
        if(!this.members_list)
        {
            if(!this.data.members)
                this.load();

            this.members_list = new IterableCollection(this.data.members).transform(function(elem)
            {
                return new Member(elem);
            });
        }
                       
        return this.members_list.findByName(data);
    }
    
    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.cardLinkedInDescription = function()
    {
        if(parts = TrelloApi.cardLinkRegExp().exec(this.description()))
            var ret = new Card({id: parts[1]});
        else
            throw new InvalidDataException("No card linked in description");
        
        return ret;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.description = function()
    {
        if(!this.data.desc)
            this.load();
        
        return this.data.desc;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.label = function(data)
    {
        return this.labels(data).first();
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.labels = function(data)
    {
        if(!this.labels_list)
        {
            if(!this.data.labels)
                this.load();
    
            try
            {
              this.labels_list = new IterableCollection(this.data.labels).transform(function(elem)
              {
                  return new Label(elem);
              });
            }
            
            catch(e)
            {
              throw new InvalidDataException("No labels present on card");
            }
        }
        
        return this.labels_list.findByName(name);
    }
    
    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.setDescription = function(desc)
    {
        TrelloApi.put("cards/"+this.data.id+"?desc="+encodeURIComponent(desc));
        return this;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.postComment = function(comment_text)
    {
        TrelloApi.post("cards/"+this.data.id+"/actions/comments?text="+encodeURIComponent(comment_text));
        return this;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.due = function()
    {
        if(!this.data.due)
            this.load();
        
        return this.data.due;
    }
    
    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.removeAllMembers = function()
    {
        this.members().each(function(elem)
        {
            this.removeMember(elem);
        }.bind(this));
      
        return this;
    }
    
    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.removeMember = function(member)
    {
        TrelloApi.del("cards/"+this.data.id+"/idMembers/"+member.data.id);
        return this;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.markDueDateComplete = function()
    {
        TrelloApi.put("cards/"+this.data.id+"?dueComplete=true");
        return this;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.removeDueDate = function()
    {
        TrelloApi.put("cards/"+this.data.id+"?due=null");
        return this;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.setDue = function(datetime)
    {
        TrelloApi.put("cards/"+this.data.id+"?due="+encodeURIComponent(datetime));
        return this;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.copyToList = function(list,position)
    {
        if(!position)
            position = "bottom";

        return new Card(TrelloApi.post("cards?pos="+position+"&idList="+list.data.id+"&idCardSource="+this.data.id+"&keepFromSource=all"));
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.copyTo = function(data,position)
    {
        if(!position)
            position = (data.position)?data.position:"bottom";

        return this.copyToList(this.board().list(TrelloApi.nameTestData(data,"list")),position);
    }

    /*Move a card to a list (in any board)*/
    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.moveToList = function(list,position)
    {
        if(!position)
            position = "bottom";

        TrelloApi.put("cards/"+this.data.id+"?idList="+list.data.id+"&idBoard="+list.board().data.id+"&pos="+position);
        return this.load();
    }

    /*Move a card to a different list within the same board*/
    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.moveTo = function(data,position)
    {
        if(!position)
            position = (data.position)?data.position:"bottom";

        return this.moveToList(this.board().list(TrelloApi.nameTestData(data,"list")),position);
    }
    
    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.archive = function()
    {
        TrelloApi.put("cards/"+this.data.id+"?closed=true");
        return this;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.unArchive = function()
    {
        TrelloApi.put("cards/"+this.data.id+"?closed=false");
        return this;
    }
    
    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.checklist = function(name)
    {
        return this.checklists(name).first();
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.checklists = function(name)
    {
        if(!this.checklist_list)         
        {
            this.checklist_list = new IterableCollection(TrelloApi.get("cards/"+this.data.id+"/checklists")).transform(function(elem)
            {
              return new Checklist(elem).setContainingCard(this);
            }.bind(this))
        }

        return this.checklist_list.findByName(name);
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.checkItemByName = function(name)
    {
        this.checklists().each(function(checklist)
        {
            checklist.items().each(function(item)
            {
                if((item.state() == "incomplete") && TrelloApi.nameTest(name,item.name()))
                    TrelloApi.put("cards/"+this.data.id+"/checkItem/"+item.data.id+"?state=complete");
            }.bind(this));
        }.bind(this));
        
        return this;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.completeAllItemsOnChecklist = function(name)
    {
        this.checklist(name).markAllItemsComplete();
        return this;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.copyUniqueChecklist = function(name,to_card)
    {
        try
        {
            return to_card.checklist(name);
        }
        
        catch(e)
        {
            Notification.expectException(InvalidDataException,e);
            return this.copyChecklist(name,to_card);
        }
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.copyChecklist = function(name,to_card)
    {
        return new Checklist(TrelloApi.post("cards/"+to_card.data.id+"/checklists?idChecklistSource="+this.checklist(name).data.id)).setContainingCard(to_card);
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.removeChecklist = function(checklist)
    {
        TrelloApi.del("cards/"+this.data.id+"/checklists/"+checklist.data.id);
        return this;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.addChecklist = function(name,callback)
    {
        try
        {
            var checklist = this.checklist(name);
        }
        
        catch(e)
        {
            var checklist = new Checklist(TrelloApi.post("cards/"+this.data.id+"/checklists?name="+encodeURIComponent(name)));
            this.checklist_list = null;
        }

        callback(checklist);
        return this;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.load = function()
    {
        this.checklist_list  = null;
        this.labels_list     = null;
        this.members_list    = null;
        this.data = TrelloApi.get("cards/"+this.data.id+"?fields=all&actions=all&attachments=true&attachment_fields=all&members=true&member_fields=all&memberVoted_fields=all&checklists=all&checklist_fields=all&board=true&board_fields=all&list=true&pluginData=true&stickers=true&sticker_fields=all");
        return this;
    }

    this.removeLabel = function(label)
    {
        TrelloApi.del("cards/"+this.data.id+"/idLabels/"+label.data.id);
        return this;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.addLabel = function(label_name)
    {
        try
        {
            var label = this.board().label({name: label_name});
            this.applyLabelIds(new IterableCollection([label.data.id]));
        }
        
        catch(e)
        {
            this.addNewLabels(new IterableCollection([label_name]));
        }
        
        return this;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.addNewLabels = function(new_labels)
    {
        new_labels.each(function(label)
        {
            try
            {
                TrelloApi.post("cards/"+this.data.id+"/labels?color=null&name="+encodeURIComponent(label));
            }
            
            catch(e)
            {
            }
        }.bind(this));
        
        return this;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).board().id();
    */
    this.applyLabelIds = function(label_ids)
    {
        label_ids.each(function(id)
        {
            try
            {
                TrelloApi.post("cards/"+this.data.id+"/idLabels?value="+encodeURIComponent(id));
            }
            
            catch(e)
            {
            }
        }.bind(this));

        return this;
    }
    
    if(!this.data.id && this.data.link)
    {
        this.data.id = TrelloApi.cardLinkRegExp().exec(this.data.link)[1];
        this.load();
    }
}

/**
* Ohai there
* @memberof module:TrelloEntities.Card
* @example
* new Notification(posted).board().id();
*/
Card.create = function(list,data)
{
    return new Card(TrelloApi.post("cards?idList="+list.data.id+"&"+new IterableCollection(data).implode("&",encodeURIComponent)));
}

/**
* Ohai there
* @memberof module:TrelloEntities.Card
* @example
* new Notification(posted).board().id();
*/
Card.findOrCreate = function(list,data)
{
    var cards = list.cards(data);
    
    try
    {
        var ret = cards.first();
    }
    
    catch(e)
    {
        var ret = Card.create(list,data);
    }
    
    return ret;
}
