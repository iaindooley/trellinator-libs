/**
* @class Card
* @memberof module:TrelloEntities
* @param data (Object} key/value pairs of 
* information, must at least contain "id",
* can basically just pass in response from Trello API
* @constructor
* @classdesc The Card class represents
* a Card in Trello. Not every Notification will
* have a card object associated with it because
* all Trellinator webhooks are registered at the
* board level (so for example a notification about
* the name of a list being updated won't have a 
* card object associated with it).
* 
* Cards are loaded from Boards or Lists, and must
* be created in a List.
*
* @example
* new Notification(posted).card().postComment("Hello world!");
* @example
* new Trellinator().board("Some Board").card(new RegExp("Find me.*"));
* @example
* new Notification(posted).board().list("ToDo").cards().first().moveToNextList();
* @example
* Card.create(new Trellinator().board("Some board").list("ToDo"),"Do it!");
* @xample
* Card.create(new Trellinator().board("Some board").list("ToDo"),{name: "Do it!"});
* @xample
* Card.findOrCreate(new Trellinator().board("Some board").list("ToDo"),"Do it!");
* @xample
* Card.findOrCreate(new Trellinator().board("Some board").list("ToDo"),{name: "Do it!"});
*/
var Card = function(data)
{    
    //allow Trello style IDs
    if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
        data['_id'] = data['_id'] || data.id;

    this.data            = data;
    this.notification_object = null;
    this.checklist_list  = null;
    this.labels_list     = null;
    this.members_list    = null;
    this.current_list = null;
    this.containing_board = null;

    /**
    * Returns the card ID
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).card().id();
    */
    this.id = function()
    {
        return Trellinator.standardId(this.data);
    }
    
    this.setNotification = function(notif)
    {
        this.notification_object = notif;
        return this;
    }
    
    /**
    * Return a Date object representing the
    * creation date of this card
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).card().whenCreated().toLocaleString();
    */    
    this.whenCreated = function()
    {
      if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
      {
          if(!this.data.createdAt)
              this.load();

          return new Date(this.data.createdAt);
      }

      else
          return new Date(1000*parseInt(this.id().substring(0,8),16));
    }
    
    /**
    * Number of days excluding saturday and sunday
    * since this card was created
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).card().weekDaysSinceCreated().toLocaleString();    
    */
    this.weekDaysSinceCreated = function()
    {
      var created = this.whenCreated().addDays(1);
      var ret = 0;
      
      while(created < Trellinator.now())
      {
        if(created.isWeekDay())
          ret++;
        
        created.addDays(1);
      }
      
      return ret;
    }
    
    /**
    * Return the notification (if any) that
    * originated this card
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).card().notification().replytoMember("Hai");
    */
    this.notification = function()
    {
        return this.notification_object;
    }

    /**
    * Removes any item from any checklist on 
    * this card matching the string or RegExp
    * passed in
    * @memberof module:TrelloEntities.Card
    * @param name {string|RegExp} the text (exact or regex match) 
    * of the checklist item to remove
    * @example
    * new Notification(posted).card().removeChecklistItemByName(new RegExp("Milk.*"));
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
        
        this.checklist_list = null;
        return this;
    }

    /**
    * Return true if the due date on this 
    * card has been marked complete, or in the case
    * of the WeKan API if a due date is set and in the past
    * @memberof module:TrelloEntities.Card
    * @example
    * var card = new Notification(posted).card();
    *
    * if(card.dueComplete())
    *     card.moveToNextList();
    */
    this.dueComplete = function()
    {
        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
        {
            if(!this.data.dueAt)
                this.load();
            
            if(this.data.dueAt && (new Date(this.data.dueAt).getTime() < new Date().getTime()))
                return true;
            else
                return false;
        }

        else
        {
            if(typeof this.data.dueComplete == "undefined")
                this.load();

            return this.data.dueComplete;
        }

    }

    /**
    * Return the Board object that this card
    * is on
    * @memberof module:TrelloEntities.Card
    * @example
    * var card = new Notification(posted).card();
    * card.board().card(card.name()).each(function(loop)
    * {
    *     if(loop.id() != card.id())
    *         loop.postComments("Twinsies with "+card.link());
    * }
    */
    this.board = function()
    {
        var ret = null;

        if(this.containing_board)
            ret = this.containing_board;
        else if(this.current_list)
            ret = this.current_list.board();
        else if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
            throw new InvalidRequestException('Cannot load a card with the WeKan API in the absence of a list/board');
        else
        {
            if(!this.data.idBoard && !this.data.board)
                this.load();
            
            var data = (this.data.board) ? this.data.board:{id: this.data.idBoard};
            ret = new Board(data);
            this.containing_board = ret;
        }
        
        if(!ret)
            throw new InvalidDataException("Board not found for card: "+this.id());
        
        return ret;
    }
    
    this.setContainingBoard = function(board)
    {
      this.containing_board = board;
      return this;
    }

    /**
    * Return a list of comments from this card
    * @memberof module:TrelloEntities.Card
    * @param limit {int} (optional) limit the number of comments
    * returned, default limit is 20
    * @example
    * new Notification(posted).card().comments().each(function(comment)
    * {
    *     Card.create(new Trellinator().board("Some Board").list("ToDo"),comment);
    * });
    */
    this.comments = function(limit)
    {
        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
        {
            return new IterableCollection(
                WekanApi.get(
                    "boards/"+this.board().id()+"/cards/"+this.id()+"/comments"
                )
            ).transform(function(elem)
            {
                return new Comment(elem);
            });
        }
        
        else
        {
            if(!limit)
                limit = 20;
    
            return new IterableCollection(TrelloApi.get("cards/"+this.data.id+"/actions?filter=copyCommentCard,commentCard&limit="+limit))
                                                   .transform(function(elem)
            {
                return new Comment(elem);
            });
        }
    }

    /**
    * Post a comment to this card
    * @memberof module:TrelloEntities.Card
    * @param comment_text {string} the text to post
    * @example
    * var card = new Notification(posted).movedCard("Done");
    * 
    * card.members().each(function(member)
    * {
    *     card.postComment("@"+member.name()+" this card was moved to the Done list");
    * });
    */
    this.postComment = function(comment_text)
    {
        if(comment_text.length > 16384)
            comment_text = comment_text.substring(0,16381)+"...";
        
        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
        {
            WekanApi.post(
                "boards/"+this.board().id()+"/cards/"+this.id()+"/comments",
                {
                    authorId: WekanApi.login().id,
                    comment: comment_text
                }
            );
        }

        else
            TrelloApi.post("cards/"+this.data.id+"/actions/comments?text="+encodeURIComponent(comment_text));

        return this;
    }


    /**
    * Return the date/time this card was moved
    * into it's current list, in the case of the WeKan API it just
    * returns the last activity date of any kind
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).card().movedToList().toLocaleString();
    */
    this.movedToList = function()
    {
        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
        {
            if(!this.data.dateLastActivity)
                this.load();
            
            return new Date(this.data.dateLastActivity);
        }
        
        else
        {
            var res = TrelloApi.get("cards/"+this.data.id+"/actions?filter=updateCard:idList&limit=1");
            
            if(!res.length)
                res = TrelloApi.get("cards/"+this.data.id+"/actions?filter=createCard&limit=1");
            
            if(res.length)
              var ret = new Date(res[0].date);
            else
              var ret = Trellinator.now();
          
            this.moved_to_list_cache = ret;
            return this.moved_to_list_cache;
        }
    }

    /**
    * Move the card to the next list in the same board
    * or throw InvalidDataException if there is no next
    * list
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).card().moveToNextList();
    */
    this.moveToNextList = function()
    {
        this.moveToList(
          this.currentList()
          .board()
          .lists()
          .itemAfter(this.currentList().id(),
                     function(test,elem)
                     {
                       return test == elem.id();
                     }),"top");
        return this;
    }

    /**
    * Move a card to a given List
    * @memberof module:TrelloEntities.Card
    * @param list {List} a list object to move the card to
    * @param position {string|int} top, bottom or a number (defaults to bottom)
    * @example
    * var to_list = new Trellinator().board("Other Board").list("ToDo");
    * new Notification(posted).createdCard("Doing").moveToList(to_list,"top");
    */
    this.moveToList = function(list,position)
    {
        if(!position)
            position = "bottom";

        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
        {
            if(list.board().id() != this.board().id())
            {
                list = this.board().findOrCreateList(list.name());
            }

            WekanApi.put(
                "boards/"+this.board().id()+"/lists/"+this.currentList().id()+"/cards/"+this.id(),
                {listId: list.id()}
            )
            
            this.current_list.card_list = null;
            this.current_list = list;
        }

        else
        {
            TrelloApi.put("cards/"+this.data.id+"?idList="+list.data.id+"&idBoard="+list.board().data.id+"&pos="+position);

            if(this.current_list)
            {
                this.current_list.card_list = null;
                this.current_list = null;
            }
    
            this.current_list = null;
            this.moved_to_list_cache = null;
            list.card_list = null;
            this.containing_board = null;
            this.data.list = null;
        }

        
        this.moved_to_list_cache = null;
        list.card_list = null;
        this.containing_board = null;
        return this;
    }

    /**
    * Return the List this card is currently in
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).archivedCard().currentList().archive();
    */
    this.currentList = function()
    {
      var ret = null;
      
      if(!this.data.list && !this.current_list)
          this.load();
      
      if(this.current_list)
          ret = this.current_list;
      
      else if(this.data.list)
          ret = new List(this.data.list);
      
      if(!ret)
        throw new InvalidDataException("Card is not in a list: "+this.id());        
      
      return ret;
    }
    
    this.setCurrentList = function(list)
    {
      this.current_list = list;
      return this;
    }
    
    /**
    * Return true if all checklists on a card
    * are complete
    * @memberof module:TrelloEntities.Card
    * @see Notification.completedAllChecklists()
    * @example
    * new Trellinator().board("Some Board").list("Doing").cards().each(function(card)
    * {
    *     if(card.allChecklistsComplete())
    *         card.moveToNextList();
    * });
    * @example
    * //This is not part of this class, but a common use case you 
    * //should be aware of instead
    * new Notification(posted).completedAllChecklists().moveToNextList();
    */
    this.allChecklistsComplete = function()
    {
        var ret = true;

        this.checklists().each(function(checklist)
        {   
            checklist.items().each(function(item)
            {   
              ret = item.isComplete();
            }.bind(this));
        }.bind(this));        
        
        return ret;
    }

    /**
    * Return an IterableCollection of all cards linked as attachments
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).card().cardsLinkedInAttachments().first().postComment("Hello from over here");
    */
    this.cardsLinkedInAttachments = function()
    {
        return this.attachments(TrelloApi.cardLinkRegExp()).find(function(elem)
        {
          try
          {
            return new Card({link: elem.link()});
          }
          
          catch(e)
          {
            if(
              (e.toString().indexOf("card not found") === 0) ||
              (e.toString().indexOf("unauthorized card permission requested") === 0)
            )
            {
              return false;
            }
            else
            {
              throw e;
            }
          }
        });
    }

    /**
    * Return an IterableCollection of all boards linked as attachments
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).card().boardsLinkedInAttachments().first().list("ToDo").cards().each(function(card)
    * {
    *     card.postComment("Ger er done!");
    * });
    */
    this.boardsLinkedInAttachments = function()
    {
        return this.attachments(TrelloApi.boardLinkRegExp()).find(function(elem)
        {
          return new Board({link: elem.link()});
        });
    }

    /**
    * Fetch the first attachment on the card. Name filtering
    * not implemented yet
    * @memberof module:TrelloEntities.Card
    * @param name {string|RegExp} not yet implemented
    * @example
    * Trellinator.log(new Notification(posted).card().attachment());
    */
    this.attachment = function(name)
    {
        return this.attachments(name).first();
    }

    /**
    * Get all attachments on the card, filtering
    * not implemented
    * @memberof module:TrelloEntities.Card
    * @param name {string|RegExp} name or RegExp, not 
    * yet implemented
    * @example
    * new Notification(posted).card().attachments().each(function(att)
    * {
    *     Trellinator.log(att);
    * });
    */
    this.attachments = function(name)
    {
        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
        {
            if(!this.data.attachments)
            {
                try
                {
                    var atts = this.checklist('Attachments');
                    
                    this.data.attachments = atts.items().find(function(att)
                    {
                        if(parts = Trellinator.regex(/\[(.+?)\]\((.+?)\)/).exec(att.name()))
                        {
                            var text = parts[1];
                            var url = parts[2];
                        }
                        
                        else
                        {
                            var text = att.name();
                            var url = att.name();
                        }
                        
                        var totest = new Attachment(
                            {
                                text: text,
                                url: url
                            }
                        );
    
                        var ret = false;
                      
                        if(
                            (name && TrelloApi.nameTest(name,totest.text())) ||
                            (name && TrelloApi.nameTest(name,totest.link())) ||
                            !name
                        )
                            ret = totest;
            
                        if(ret)
                            ret.setContainingCard(this);
                        
                        return ret;
                    });
                }
                
                catch(e)
                {
                    Notification.expectException(InvalidDataException,e);
                    this.data.attachments = new IterableCollection();
                }
            }
            
            return this.data.attachments;
        }

        else
        {
            if(!this.data.attachments)
                this.load();
    
            return new IterableCollection(this.data.attachments).find(function(elem)
            {
                var totest = new Attachment(elem);
                var ret = false;
              
                if(name && TrelloApi.nameTest(name,totest.text()))
                    ret = new Attachment(elem);
                else if(name && TrelloApi.nameTest(name,totest.link()))
                    ret = new Attachment(elem);
                else if(!name)
                    ret = totest;
    
                if(ret)
                    ret.setContainingCard(this);
    
                return ret;
            }.bind(this));
        }
    }

    /**
    * Return a link to this card
    * @memberof module:TrelloEntities.Card
    * @example
    * var notif = new Notification(posted);
    * notif.card().cardsLinkedInAttachments().first().checkItemByName(notif.card().link());
    */
    this.link = function()
    {
        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
           return this.board().link()+"/"+this.id();
        else
            return "https://trello.com/c/"+this.shortId();
    }

    /**
    * Return the short ID of this card
    * @memberof module:TrelloEntities.Card
    * @example
    * var notif = new Notification(posted);
    * notif.card().shortId();
    */
    this.shortId = function()
    {
        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
            return this.id();
        else
        {
            if(!this.data.shortLink)
                this.load();
            
            return this.data.shortLink;
        }
    }
    
    
    /**
    * Return a link to this card formatted so
    * that it can be used in a checklist item name
    * such that the link will work on both mobile and
    * web/desktop apps
    * @memberof module:TrelloEntities.Card
    * @example
    * var notif = new Notification(posted);
    * notif.card().mobileFriendlyLink();
    */
    this.mobileFriendlyLink = function()
    {
      return "["+this.name().replaceAll("@","AT").replaceAll(/[<>"]/,"")+"]("+this.link()+")";
    }
    
    /**
    * Add a link attachment to this card
    * @memberof module:TrelloEntities.Card
    * @param data {string|Object} either a string that is a fully 
    * formed URL, or an object that contains at least either
    * an attribute link or url, and optionally one of these as
    * well as a name attribute
    * @example
    * var notif = new Notification(posted);
    *
    * var notif.card().addChecklist("Linked Cards",function(list)
    * {
    *     notif.board().list("ToDo").cards().each(function(card)
    *     {
    *         list.addItem(card.link());
    *         card.attachLink(notif.card().link());
    *     });
    * });
    * @example
    * new Notification(posted).card().attachLink({name: "A Popular Search Engine",url: "https://www.google.com/"});
    * @example
    * new Notification(posted).card().attachLink({name: "A Popular Search Engine",link: "https://www.google.com/"});
    */
    this.attachLink = function(data)
    {
        if(data.url)
            var link = data.url;
        else if(typeof data.link == "string")
            var link = data.link;
        else
            var link = data;

        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
        {
            this.addChecklist("Attachments",function(cl)
            {
                if(WekanApi.cardLinkRegExp().test(link))
                    cl.addItem(new Card({link: link}).mobileFriendlyLink());
                else
                {
                    var name = data.name || link;
                    cl.addItem('['+name+']('+link+')');
                }
            }.bind(this));
        }

        else
        {
            
            var url = "cards/"+this.data.id+"/attachments?url="+encodeURIComponent(link);
            
            if(data.name)
            {
              var maxlength = 256;
              var ltrimmed_name = data.name.substr(data.name.length-maxlength);
              url += "&name="+encodeURIComponent(ltrimmed_name);
            }
            
            TrelloApi.post(url);
        }
        
        if(this.data.attachments)
          this.data.attachments = null;
        
        return this;
    }
    
    /**
    * Download a file from a URL to Google Drive, then add it
    * as a link to the card. I can't see a good way to add a file
    * directly by URL either from the internet or from Google Drive
    * so this should be updated at some point.
    * @memberof module:TrelloEntities.Card
    * @param data {string|Object} either a string that is a fully 
    * formed URL, or an object that contains at least either
    * an attribute link or url, and optionally one of these as
    * well as a name attribute
    * @example
    * var notif = new Notification(posted);
    * card.attachFile(notif.card().attachments().first().link());
    */
    this.attachFile = function(data)
    {
        if(data.url)
            var link = data.url;
        else if(typeof data.link == "string")
            var link = data.link;
        else
            var link = data;
      
      var file = Trellinator.downloadFileToGoogleDrive(link);
      this.attachLink({name: file.getName(),url: file.getUrl()});
    }

    /**
    * Set the name of this card
    * @memberof module:TrelloEntities.Card
    * @param name {string} the new name for the card
    * @example
    * new Notification(posted).card().setName("UPDATED");
    */
    this.setName = function(name)
    {
        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
            WekanApi.put("boards/"+this.board().id()+"/lists/"+this.currentList().id()+"/cards/"+this.id(),{title: name});
        else
            TrelloApi.put("cards/"+this.data.id+"?name="+encodeURIComponent(name));

        this.data.name = name;
        this.data.text = name;
        return this;
    }

    /**
    * Return the name of this card (also sometimes
    * called the title of the card)
    * @memberof module:TrelloEntities.Card
    * @example
    * Trellinator.log(new Notification(posted).card().name());
    */
    this.name = function()
    {
        if(
            (typeof this.data.name === 'undefined') &&
            (typeof this.data.text === 'undefined') &&
            (typeof this.data.title === 'undefined')
        )
            this.load();

        return this.data.text || this.data.name || this.data.title;
    }
    
    /**
    * Add a member to this card
    * @memberof module:TrelloEntities.Card
    * @param member {Member} a Member object to add to the
    * card
    * @example
    * var notif = new Notification();
    * var created = notif.createdCard();
    *
    * notif.board().members().each(function(member)
    * {
    *     notif.card().addMember(member);
    * });
    */
    this.addMember = function(member)
    {
        try
        {
            if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
            {
                var unique_mems = {};
                
                this.members().each(function(loop)
                {
                    unique_mems[loop.id()] = 1;
                });
                
                unique_mems[member.id()] = 1;
                
                WekanApi.put(
                    "boards/"+this.board().id()+"/lists/"+this.currentList().id()+"/cards/"+this.id(),
                    {
                        members: Object.keys(unique_mems)
                    }
                );
            }
            
            else
                TrelloApi.post("cards/"+this.data.id+"/idMembers?value="+member.data.id);

            this.members_list    = null;
        }
        
        catch(e)
        {
            Notification.expectException(InvalidRequestException,e);
            
            if(e.toString().indexOf("member is already on the card") == -1)
                throw e;
        }

        return this;
    }

    /**
    * Return a Member of this card matching
    * the given name/regex
    * @memberof module:TrelloEntities.Card
    * @param name {string|RegExp} a name or RegExp to match
    * @example
    * new Notification(posted).card().member("iaindooley");
    */
    this.member = function(name)
    {
        return this.members(name).first();
    }
    
    /**
    * Return an IterableCollection of Members on this card
    * optionally filtered by name using a string or RegExp
    * @memberof module:TrelloEntities.Card
    * @param name {string|RegExp} a name or RegExp to filter by
    * @example
    * var card = new Notification(posted).archivedCard();
    *
    * card.members().each(function(member)
    * {
    *     card.postComment("@"+member.name()+" this card was archived");
    * });
    */
    this.members = function(name)
    {
        if(!this.members_list)
        {
            if(!this.data.members)
                this.load();

            this.members_list = new IterableCollection(this.data.members).find(function(elem)
            {
                if((prov = Trellinator.provider()) && (prov.name == "WeKan") && elem)
                    elem = {id: elem};
                
                if(elem)
                    return new Member(elem);
                else
                    return false;
            });
        }
                       
        return this.members_list.findByName(name);
    }
    
    /**
    * Return a Card if there is one linked in the
    * description of this card
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).archivedCard().cardLinkedInDescription().postComment("Your pal was archived");
    */
    this.cardLinkedInDescription = function()
    {
        if(parts = TrelloApi.cardLinkRegExp().exec(this.description()))
        {
            if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
                var ret = new Card({link: parts[0]});
            else
                var ret = new Card({id: parts[1]});
        }

        else
            throw new InvalidDataException("No card linked in description");
        
        return ret;
    }

    /**
    * Return the description of this card
    * @memberof module:TrelloEntities.Card
    * @example
    * var card = new Notification(posted).changedCardName();
    * 
    * card.setDescription(Trellinator.now().toLocaleString()+" updated to "+card.name()+"\n\n"+card.description());
    */
    this.description = function()
    {
        if(!this.data.desc && !this.data.description)
            this.load();
        
        return this.data.desc || this.data.description;
    }

    /**
    * Return a Label if it is on this card, or false
    * if the label is not on the card
    * @memberof module:TrelloEntities.Card
    * @param name {string|RegExp} a string or RegExp to match
    * the label name against
    * @example
    * //check if a due date was marked complete on a card with label starting with "Process"
    * var added = new Notification(posted).addedLabel("Old");
    * 
    * if(added.card().hasLabel("New"))
    *     added.card().postComment("Something old and something new");
    */
    this.hasLabel = function(name)
    {
        try
        {
            return this.labels(name).first();
        }
        
        catch(e)
        {
            return false;
        }
    }

    /**
    * Return a Label if it is on this card, or throw
    * InvalidDataException if it isn't on the card
    * @memberof module:TrelloEntities.Card
    * @param name {string|RegExp} a string or RegExp to match
    * the label name against
    * @example
    * //check if a due date was marked complete on a card with label starting with "Process"
    * new Notification(posted).completedDueDate().label(new RegExp("Process.*"));
    */
    this.label = function(name)
    {
        return this.labels(name).first();
    }

    /**
    * Return an IterableCollection of Label objects that
    * are on this card optionally filtered by name/regexp
    * @memberof module:TrelloEntities.Card
    * @param name {string|RegExp} a string or RegExp to filter
    * against
    * @example
    * new Notification(posted).card().labels().each(function(label)
    * {
    *     Trellinator.log(label.name());
    * });
    */
    this.labels = function(name)
    {
        if(!this.labels_list)
        {
            if(!this.data.labels && !this.data.labelIds)
                this.load();
    
            if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
            {
                this.labels_list = new IterableCollection(this.data.labelIds).transform(function(elem)
                {
                    return new Label({id: elem}).setContainingCard(this);
                }.bind(this));
            }

            else
            {
                this.labels_list = new IterableCollection(this.data.labels).transform(function(elem)
                {
                    return new Label(elem).setContainingCard(this);
                }.bind(this));
            }
        }
        
        return this.labels_list.findByName(name);
    }
    
    /**
    * Set the description of this card
    * @memberof module:TrelloEntities.Card
    * @param desc {string} The description to set on the card
    * @example
    * var card = new Notification(posted).archivedCard();
    * card.setDescription("Archived on: "+Trellinator.now().toLocaleString()+"\n\n"+card.description());
    */
    this.setDescription = function(desc)
    {
        if(desc.length > 16384)
            desc = desc.substring(0,16381)+"...";

        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
            WekanApi.put("boards/"+this.board().id()+"/lists/"+this.currentList().id()+"/cards/"+this.id(),{description: desc});
        else
            TrelloApi.put("cards/"+this.data.id+"?desc="+encodeURIComponent(desc));
        
        this.data.desc = desc;
        this.data.description = desc;
        return this;
    }

    /**
    * Return the due date for this Card, which 
    * can be passed into the constructor of a Date object
    * @memberof module:TrelloEntities.Card
    * @example
    * new Date(new Notification(posted).card().due());
    */
    this.due = function()
    {
        if(!this.data.due && !this.data.dueAt)
            this.load();
        
        return this.data.due || this.data.dueAt;
    }
    
    /**
    * Remove all members from this card
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).movedCard("Done").removeAllMembers();
    */
    this.removeAllMembers = function()
    {
        this.members().each(function(elem)
        {
            this.removeMember(elem);
        }.bind(this));
      
        this.members_list = null;
        return this;
    }

    /**
    * Remove all labels from this card
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).movedCard("Done").removeAllLabels();
    */
    this.removeAllLabels = function()
    {
        this.labels().each(function(elem)
        {
            this.removeLabel(elem);
        }.bind(this));
      
        this.labels_list = null;
        return this;
    }
    
    /**
    * Remove a member from this card
    * @memberof module:TrelloEntities.Card
    * @param member {Member} a Member object to remove from this
    * card
    * @example
    * var notif  = new Notification(posted);
    * 
    * if(new RegExp("Remove.*").test(notif.addedComment().text()))
    * {
    *    notif.card().removeMember(notif.member());
    * }
    */
    this.removeMember = function(member)
    {
        try
        {
            if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
            {
                var unique_mems = {};
                
                this.members().each(function(loop)
                {
                    if(
                        (loop.id() != member.id()) &&
                        (loop.username() != member.username())
                    )
                        unique_mems[loop.id()] = 1;
                });
                
                WekanApi.put(
                    "boards/"+this.board().id()+"/lists/"+this.currentList().id()+"/cards/"+this.id(),
                    {
                        members: Object.keys(unique_mems)
                    }
                );
            }
            
            else
            {
                TrelloApi.del("cards/"+this.data.id+"/idMembers/"+member.data.id);
            }

            this.members_list = null;
            this.data.members = null;
        }

        catch(e)
        {
            if(e.toString().indexOf("member is not on the card") == -1)
                throw e;
        }

        return this;
    }

    /**
    * Mark the due date on this card complete
    * @memberof module:TrelloEntities.Card
    * @example
    * //Mark the due date complete on a card that was moved into the Done list
    * new Notification(posted).movedCard("Done").markDueDateComplete();
    */
    this.markDueDateComplete = function()
    {
        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
            throw new InvalidRequestException("Unable to mark due dates complete in WeKan API");
        
        TrelloApi.put("cards/"+this.data.id+"?dueComplete=true");
        this.data.dueComplete = true;
        return this;
    }

    /**
    * Mark the due date on this card incomplete
    * @memberof module:TrelloEntities.Card
    * @example
    * //Mark the due date complete on a card that was moved into the Done list
    * new Notification(posted).movedCard("Done").markDueDateIncomplete();
    */
    this.markDueDateIncomplete = function()
    {
        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
            throw new InvalidRequestException("Unable to mark due dates incomplete in WeKan API");

        TrelloApi.put("cards/"+this.data.id+"?dueComplete=false");
        this.data.dueComplete = false;
        return this;
    }

    /**
    * Clear the due date on this card
    * @memberof module:TrelloEntities.Card
    * @example
    * //Remove the due date on a card that was moved to the Backlog list
    * new Notification(posted).movedCard("Backlog").removeDueDate();
    */
    this.removeDueDate = function()
    {
        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
            WekanApi.put("boards/"+this.board().id()+"/lists/"+this.currentList().id()+"/cards/"+this.id(),{dueAt: null});
        else
            TrelloApi.put("cards/"+this.data.id+"?due=null");

        this.data.due = null;
        this.data.dueAt = null;
        return this;
    }

    /**
    * Set the due date on this card
    * @memberof module:TrelloEntities.Card
    * @param datetime {Date} a Date object
    * @example
    * //When a card is created in the ToDo list set it due in 3 days time at 9am 
    * new Notification(posted).createdCard("ToDo").setDue(Trellinator.now().addDays(3).at("9:00"));
    */
    this.setDue = function(datetime)
    {
        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
            WekanApi.put("boards/"+this.board().id()+"/lists/"+this.currentList().id()+"/cards/"+this.id(),{dueAt: datetime});
        else
            TrelloApi.put("cards/"+this.data.id+"?due="+encodeURIComponent(datetime.toUTCString()));

        this.data.due = datetime;
        this.data.dueAt = datetime;
        return this;
    }

    /**
    * Copy this card to a given List, optionally to 
    * a specific position, and return the copy
    * @memberof module:TrelloEntities.Card
    * @param list {List} a List object to copy this card to
    * @param position {string|int} either top, bottom or a number
    * @param keep (optional) {string} default is "all", but can be "none" or a comma separated list: attachments, checklists, due, labels, members, stickers, customFields
    * @example
    * var list = new Trellinator().board("Some Board").findOrCreateList("ToDo");
    * //Copy the card to a list ToDo in the board Some Board in position 2
    * new Notification(posted).card().copyToList(list,2);
    */
    this.copyToList = function(list,position,keep)
    {
        if(!position)
            position = "top";
        if(!keep)
            keep = "all";

        list.card_list = null;
        
        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
        {
            var member_ids = [];

            if(keep == "members")
            {
                this.members().each(function(member)
                {
                    member_ids.push(member.id());
                });
            }

            var carddata = {
                title: this.name(),
                description: this.description(),
                members: member_ids.join(","),
                authorId: WekanApi.login().id,
                swimlaneId: list.board().defaultSwimlane().id()
            };
            
            if(member_ids.length)
                carddata.members = member_ids.join(",");
            
            var curcard = Card.create(list,carddata);
            var label_ids = [];

            this.labels().each(function(label)
            {
                label_ids.push(list.board().label(label.name()).id());
            });

            if(label_ids.length)
                curcard.applyLabelIds(new IterableCollection(label_ids));
            
            this.checklists().each(function(cl)
            {
                var items = cl.items().find(function(item)
                {
                    return item.name();
                }).asArray();

                curcard.addChecklist({title: cl.name(),items: items});
            });
            
            if(this.due())
                curcard.setDue(this.due());
        }

        else
            return new Card(TrelloApi.post("cards?pos="+position+"&idList="+list.data.id+"&idCardSource="+this.data.id+"&keepFromSource="+encodeURIComponent(keep)));
    }

    /**
    * Copy this card to a list on the same board
    * and return the copy
    * @memberof module:TrelloEntities.Card
    * @param name {string|RegExp} a string list name, or 
    * regex (if multiple matches, the first matching list will be used
    * @param position {string|int} top, bottom or a number
    * @example
    * new Notification(posted).card().copyTo("ToDo","top");
    */
    this.copyTo = function(name,position,keep)
    {
        if(!position)
            position = (name.position)?name.position:"top";

        return this.copyToList(this.board().list(TrelloApi.nameTestData(name,"list")),position,keep);
    }

    /**
    * Move a card to a list within the same board
    * @memberof module:TrelloEntities.Card
    * @param name {string|RegExp} the name or a regex to match a 
    * list within the same board to move the card to
    * @param position {string|int} (optional) top, bottom or a number, default bottom
    * @example
    * new Notification(posted).archivedCard().unArchive().moveTo("Graveyard","top");
    */
    this.moveTo = function(name,position)
    {
        if(!position)
            position = (name.position)?name.position:"bottom";

        return this.moveToList(this.board().list(TrelloApi.nameTestData(name,"list")),position);
    }
    
    /**
    * Delete this card NO UNDO AVAILABLE
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).movedCard("Done").del();
    */
    this.del = function()
    {
        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
            WekanApi.del("boards/"+this.board().id()+"/lists/"+this.currentList().id()+"/cards/"+this.id());
        else
            TrelloApi.del("cards/"+this.data.id);
        return this;
    }

    /**
    * Archive this card
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).movedCard("Done").archive();
    */
    this.archive = function()
    {
        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
        {
            this.moveToList(
                this.board().findOrCreateList("Archive")
            );
        }
        
        else
            TrelloApi.put("cards/"+this.data.id+"?closed=true");

        this.currentList().card_list = null;
        return this;
    }

    /**
    * Unarchive this card
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).archivedCard().unArchive();
    */
    this.unArchive = function()
    {
        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
            throw new InvalidRequestException("Cannot unarchive cards with the WeKan API");
        else
            TrelloApi.put("cards/"+this.data.id+"?closed=false");

        this.currentList().card_list = null;
        return this;
    }
    
    /**
    * Check if this card is archived
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).archivedCard().isArchived();
    */
    this.isArchived = function()
    {
        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
        {
            return (this.currentList().name() == "Archive");
        }
        
        else
        {
            if(typeof this.data.closed === 'undefined')
              this.load();
            
            return this.data.closed;
        }
    }
    
    /**
    * Return a checklist from this card of the given
    * name if it exists or throw InvalidDataException
    * @memberof module:TrelloEntities.Card
    * @param name {string|RegExp} a name or RegExp to match against
    * the checklist name (first will be returned if multiple match)
    * @example
    * new Notification(posted).movedCard("Done").checklist(new RegExp("Process.*")).markAllItemsComplete();
    */
    this.checklist = function(name)
    {
        return this.checklists(name).first();
    }

    /**
    * Return an IterableCollection of Checklist objects
    * optionally filtered by name/RegExp
    * @memberof module:TrelloEntities.Card
    * @param name {string|RegExp} a string or regex to filter the list by
    * @example
    * new Notification(posted).completedDueDate().checklists(new RegExp("Process.*")).each(function(list)
    * {
    *     list.markAllItemsComplete();
    * });
    */
    this.checklists = function(name)
    {
        if(!this.checklist_list)         
        {
            if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
            {
                this.checklist_list = new IterableCollection(WekanApi.get("boards/"+this.board().id()+"/cards/"+this.id()+"/checklists")).transform(function(elem)
                {
                  return new Checklist(elem).setContainingCard(this);
                }.bind(this))
            }

            else
            {
                this.checklist_list = new IterableCollection(TrelloApi.get("cards/"+this.data.id+"/checklists")).transform(function(elem)
                {
                  return new Checklist(elem).setContainingCard(this);
                }.bind(this))
            }
        }

        return this.checklist_list.findByName(name);
    }

    /**
    * Check any item in any checklist with the given
    * name or matching RegExp
    * @memberof module:TrelloEntities.Card
    * @param name {string|RegExp} the name of the checklist item
    * to complete, or a RegExp (all matching items will be completed)
    * @example
    * var card = new Notification(posted).archivedCard();
    * cards.cardsLinkedInAttachments().first().checkItemByName(card.link());
    */
    this.checkItemByName = function(name)
    {
        this.checklists().each(function(checklist)
        {
            checklist.items().each(function(item)
            {
                if((item.state() == "incomplete") && TrelloApi.nameTest(name,item.name()))
                {
                    if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
                        WekanApi.put("boards/"+this.board().id()+"/cards/"+this.id()+"/checklists/"+checklist.id()+"/items/"+item.id(),{isFinished: "true"});
                    else
                        TrelloApi.put("cards/"+this.data.id+"/checkItem/"+item.data.id+"?state=complete");
                }
            }.bind(this));
        }.bind(this));
        
        this.checklist_list  = null;
        return this;
    }

    /**
    * Copy a checklist from this card, to another
    * card if it doesn't already exist on that card
    * and return either the new checklist or the 
    * checklist that already existed
    * @memberof module:TrelloEntities.Card
    * @param name {string|RegExp} the name of the checklist
    * to copy, can be a string or RegExp, if more than one matches
    * will just copy the first found
    * @param to_card {Card} the card to copy the checklist to
    * var notif = new Notification(posted);
    * //Copy a checklist to a card if it was moved or added to the ToDo list
    * notif.board().card("Templates").copyUniqueChecklist("Some Procedure",notif.addedCard("ToDo"));
    */
    this.copyUniqueChecklist = function(name,to_card,position)
    {
        try
        {
            return to_card.checklist(name);
        }
        
        catch(e)
        {
            Notification.expectException(InvalidDataException,e);
            return this.copyChecklist(name,to_card,position);
        }
    }

    /**
    * Copy a checklist to another card from this card
    * even if it already exists on the target card
    * and return the new checklist
    * @memberof module:TrelloEntities.Card
    * @param name {string|RegExp} the name of the checklist to
    * copy, if multiple matches will just take the first found
    * @param to_card {Card} the card to copy the checklist to
    * @param position {string} (optional) either top or bottom, or a positive number, defaults to bottom
    * @example
    * var notif = new Notification(posted);
    * //Copy a checklist to a card if it was moved or added to the ToDo list
    * notif.board().card("Templates").copyChecklist("Some Procedure",notif.addedCard("ToDo"));
    */
    this.copyChecklist = function(name,to_card,position)
    {
        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
        {
            var ret = null;
            to_card.addChecklist(
                {   
                    title: name,
                    items: this.checklist(name).items().find(function(item)
                    {   
                        return item.name();
                    }).asArray()
                },
                function(cl)
                {
                    ret = cl;
                }
            );
        }

        else
            var ret = new Checklist(TrelloApi.post("cards/"+to_card.id()+"/checklists?idChecklistSource="+this.checklist(name).id())).setContainingCard(to_card);

        //HACK: The post endpoint for adding a checklist to a card ignores the pos parameter
        //so we need a separate put to update the position once added
        if(position)
            ret.setPosition(position);

        this.checklist_list = null;
        to_card.checklist_list = null;
        return ret;
    }

    /**
    * Remove a checklist from this card
    * @memberof module:TrelloEntities.Card
    * @param checklist {Checklist} the checklist to remove
    * @example
    * var card = new Notification(posted).movedCard("Done");
    * card.removeChecklist(card.checklist("Some Process"));
    */
    this.removeChecklist = function(checklist)
    {
        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
            checklist.remove();
        else
            TrelloApi.del("cards/"+this.data.id+"/checklists/"+checklist.data.id);

        this.checklist_list  = null;
        return this;
    }

    /**
    * Add a checklist to this card, or pass an
    * existing checklist into the callback if it already
    * exists on this card
    * @memberof module:TrelloEntities.Card
    * @param name {string} The name of the checklist to add
    * @param callback {Function} a callback which will recieve
    * the new or existing Checklist object to add items to it
    * @param position {string} (optional) top, bottom, a number, defaults
    * to "bottom"
    * @example
    * new Notification(posted).movedCard("ToDo").addChecklist("Do Stuff",function(cl)
    * {
    *     cl.addItem("Did you do this yet?");
    * });
    */
    this.addChecklist = function(name,callback,position)
    {
        try
        {
            if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
            {
                if(typeof name === "string")
                    var test = name;
                else
                    var test = name.title;
            }

            else
                var test = name;

            var checklist = this.checklist(name);
        }
        
        catch(e)
        {
            //var checklist = new Checklist(TrelloApi.post("cards/"+this.data.id+"/checklists?name="+encodeURIComponent(name)+"&pos="+encodeURIComponent(position))).setContainingCard(this);
            Notification.expectException(InvalidDataException,e);
            
            if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
            {
                if(typeof name === "string")
                { 
                    name = {title: name};
            
                    if(!position)
                        position = "top";
            
                    data.position = position;
                }

                var checklist = new Checklist(WekanApi.post("boards/"+this.board().id()+"/cards/"+this.id()+"/checklists",name)).setContainingCard(this);
            }

            else
                var checklist = new Checklist(TrelloApi.post("cards/"+this.data.id+"/checklists?name="+encodeURIComponent(name))).setContainingCard(this);

            this.checklist_list = null;
        }
        
        //HACK: The post endpoint for adding a checklist to a card ignores the pos parameter
        //so we need a separate put to update the position once added
        if(position)
            checklist.setPosition(position);

        if(callback)
            callback(checklist);

        return this;
    }

    /**
    * Remove a label from this card by label object
    * @memberof module:TrelloEntities.Card
    * @param label {Label} a Label object to remove from this card
    * @example
    * var notif = new Notification(posted);
    * notif.card().removeLabel(notif.board().label("Some Label"));
    */
    this.removeLabel = function(label)
    {
        try
        {
            if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
            {
                var new_ids = this.labels().find(function(loop)
                {
                    if(loop.id() != label.id())
                        return label.id();
                    else
                        return false;
                }).asArray();
                	
                WekanApi.put('boards/'+this.board().id()+'/lists/'+this.currentList().id()+'/cards/'+this.id(),{labelIds: new_ids.join(",")});
            }
            
            else
                TrelloApi.del("cards/"+this.data.id+"/idLabels/"+label.id());

            this.labels_list = null;
        }

        catch(e)
        {
            Notification.expectException(InvalidRequestException,e);
        }

        return this;
    }

    /**
    * Add a label to the card by name, whether it 
    * already exists in the board or not
    * @memberof module:TrelloEntities.Card
    * @param label_name {string} The name of the label to add
    * @example
    * new Notification(posted).card().addLabel("New");
    */
    this.addLabel = function(label_name)
    {
        try
        {
            var label = this.board().label(label_name);
            this.applyLabelIds(new IterableCollection([label.id()]));
        }
        
        catch(e)
        {
            Notification.expectException(InvalidDataException,e);
            this.addNewLabels(new IterableCollection([label_name]));
        }
        
        this.labels_list = null;
        this.data.labels = null;
        return this;
    }

    /**
    * Add new labels that don't already exist to a card
    * by name. You should just use the addLabel() method instead
    * @memberof module:TrelloEntities.Card
    * @param new_labels {Array} an array of label names to create
    * on this board and added to the card
    */
    this.addNewLabels = function(new_labels)
    {
        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
        {
            var to_add = [];

            new_labels.each(function(label)
            {
                try
                {
                    to_add.push(this.board().label(label).id());
                }

                catch(e)
                {
                    var labadd = this.board().addLabel(label);
                    to_add.push(labadd.id());
                }

                console.log(to_add);
                this.applyLabelIds(new IterableCollection(to_add));
            }.bind(this));
        }
        
        else
        {
            new_labels.each(function(label)
            {
                try
                {
                    TrelloApi.post("cards/"+this.data.id+"/labels?color=null&name="+encodeURIComponent(label));
                }
                
                catch(e)
                {
                    if(e.toString().indexOf("that label is already on the card") == -1)
                        throw e;
                }
    
            }.bind(this));
        }
        
        this.labels_list = null;
        return this;
    }

    /**
    * Add existing labels to a card by ID. You should just
    * use the addLabel method instead
    * @memberof module:TrelloEntities.Card
    * @param label_ids {Array} an array of label_ids
    */
    this.applyLabelIds = function(label_ids)
    {
        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
        {
            var our_ids = this.labels().find(function(label)
            {
                return label.id();
            });
            	
            var all_ids = {};
            
            our_ids.each(function(id)
            {
                all_ids[id] = 1;
            });

            label_ids.each(function(id)
            {
                all_ids[id] = 1;
            });
            
            var unique_ids = Object.keys(all_ids);
            WekanApi.put('boards/'+this.board().id()+'/lists/'+this.currentList().id()+'/cards/'+this.id(),{labelIds: unique_ids.join(",")});
        }
        
        else
        {
            label_ids.each(function(id)
            {
                try
                {
                    TrelloApi.post("cards/"+this.data.id+"/idLabels?value="+encodeURIComponent(id));
                }
                
                catch(e)
                {
                    if(e.toString().indexOf("that label is already on the card") !== 0)
                        throw e;
                }
            }.bind(this));
        }

        this.labels_list = null;
        return this;
    }

    /**
    * Return the value of a custom field by name.
    * This works for all field types, and the value is
    * converted to the appropriate data type based on
    * the type of field (eg. number/date/etc)
    *
    * If the Custom Fields power up is not enabled
    * this method will attempt to enable it. If it can't
    * be enabled because the board has reached the power up
    * limit, an unexpected exception is thrown.
    *
    * If a field with the given name doesn't exist it will 
    * be created as a text type field
    * @memberof module:TrelloEntities.Card
    * @param field_name {striung} the name of the field to get the value for on this card
    * @example
    * new Notification(posted).card().customFieldValue("My Field");
    */
    this.customFieldValue = function(field_name)
    {
        var field = this.findOrCreateCustomFieldFromName(field_name);
        var ret = false;

        this.customFields().each(function(loop)
        {
            if(loop.idCustomField == field.id)
            {
                ret = this.extractCustomFieldValueFromDataBasedOnType(loop);
            }
        }.bind(this));
        
        return ret;
    }

    //INTERNAL USE ONLY
    this.extractCustomFieldValueFromDataBasedOnType = function(data)
    {
        var ret = "";

        if(data.value)
        {
            for(var key in data.value)
            {
                switch(key)
                {
                    case "text":
                        ret = data.value[key];
                    break;
                      
                    case "number":
                        ret = parseFloat(data.value[key]);
                    break;
                      
                    case "checked":
                        ret = (data.value[key] === 'true') ? true:false;
                    break;
                      
                    case "date":
                        ret = new Date(data.value[key]);
                    break;
                      
                    default:
                        ret = "";
                    break;
                }
            }
        }
        
        else if(data.idValue)
        {
            new IterableCollection(TrelloApi.get("customField/"+data.idCustomField+"/options")).each(function(option)
            {
                if(data.idValue == option._id)
                    ret = option.value.text;
            });

        }
        
        return ret;
    }

    /**
    * Get an IterableCollection of all custom fields
    * as raw objects for this card (not really that useful)
    * @memberof module:TrelloEntities.Card
    */
    this.customFields = function()
    {
        return new IterableCollection(TrelloApi.get("cards/"+this.id()+"/customFieldItems"));
    }

    /**
    * Set the value of a custom field. Automatically converts
    * the value to the correct type for the API, including
    * looking up dropdown options etc. 
    *
    * If the Custom Fields power up is not enabled
    * this method will attempt to enable it. If it can't
    * be enabled because the board has reached the power up
    * limit, an unexpected exception is thrown.
    *
    * If a field with the given name doesn't exist it will 
    * be created as a text type field.
    * @memberof module:TrelloEntities.Card
    * @param field_name {string} the name of the field to get the value for on this card
    * @param field_value {string|Date|int|float|double|boolean} the value to set
    * @example
    * new Notification(posted).card().setCustomFieldValue("My Field","Hi there");
    */
    this.setCustomFieldValue = function(field_name,value)
    {
        var field = this.findOrCreateCustomFieldFromName(field_name);
        var url = "https://api.trello.com/1/card/"+this.id()+"/customField/"+field.id+"/item";
        
        var payload = {
            key: TrelloApi.checkControlValues().key,
            token: TrelloApi.checkControlValues().token
          };

        this.insertTrelloCustomFieldValue(payload,value,field);
        HttpApi.call("put",url,"",{"content-type": "application/json"},JSON.stringify(payload));
        return this;
    }

    //INTERNAL USE ONLY
    this.findOrCreateCustomFieldFromName = function(field_name)
    {
        return this.board().findOrCreateCustomFieldFromName(field_name);
    }

    //INTERNAL USE ONLY
    this.insertTrelloCustomFieldValue = function(payload,value,field)
    {
      //Clear the field if the value is empty
      if ( value === "" || value === null || value === undefined ) {
        payload.value = "";
        payload.idValue = "";
      }
      
      else
      {
        
        switch (field.type)
        {
          case "text":
            payload.value = { text: value.toString() };
            break;
            
          case "number":
            var n = parseFloat(value);
            if ( isNaN(n) ) {
              payload.value = "";
            } else {
              payload.value = {number: n.toString() };
            }
            break;
            
          case "checkbox":
            payload.value = {checked: (!!value).toString() };
            break;
            
          case "date":
            var d = new Date(value);
            if ( isNaN( d.getTime() ) ) {
              payload.value = "";
            } else {
              payload.value = { date: d.toISOString() };
            }
            break;
            
          case "list":
            payload.idValue = "";
            
            new IterableCollection(field.options).each(function(opt)
                                                       {
                                                         if(opt.value.text == value)
                                                           payload.idValue = opt.id;
                                                       });
            break;
            
          default:
            //This shouldn't happen. We can't assume the type, so we clear the field instead.
            payload.value = "";
            break;
        }
      }
    }
    
    /**
    * Add a custom or default sticker.
    * @param sticker {string} To add a custom sticker, pass in the ID of a custom
    * sticker, fetched with Member.customStickers, for
    * example new Trellinator().customStickers() if your 
    * custom sticker list was created by your Trellinator
    * user. Note that custom stickers are only avialable in business/enterprise
    * class accounts. Otherwise you can pass in a predefined sticker from this list:
    * 
    * Standard stickers (available in free accounts):
    * - check
    * - heart
    * - warning
    * - clock
    * - smile
    * - laugh
    * - huh
    * - frown
    * - thumbsup
    * - thumbsdown
    * - star
    * - rocketship
    * 
    * Premium stickers (business/enterprise class only):
    * - taco-love
    * - taco-confused
    * - taco-cool
    * - taco-angry
    * - taco-celebrate
    * - taco-robot
    * - taco-alert
    * - taco-active
    * - taco-money
    * - taco-reading
    * - taco-trophy
    * - taco-sleeping
    * - taco-pixel
    * - taco-proto
    * - taco-embarrassed
    * - taco-clean
    * - pete-happy
    * - pete-love
    * - pete-broken
    * - pete-alert
    * - pete-talk
    * - pete-vacation
    * - pete-confused
    * - pete-shipped
    * - pete-busy
    * - pete-completed
    * - pete-space
    * - pete-sketch
    * - pete-ghost
    * - pete-award
    * - pete-music
    * @param top {int} (optional) y co-ordinate between -60 and 100 default 0
    * @param left {int} (optional) x co-ordinate between -60 and 100 default 0 
    * @param rotate {int} (optional) degree of rotation between 0 and 360 default 0
    * @param z {int} (optional) z-index (ie. if this should sit "on top" of other stickers) 0 is highest, ie. "on top" of everything else, and is the default
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).card().addSticker("pete-happy");
    */
    this.addSticker = function(sticker,top,left,rotate,z)
    {
        if(!top)
            top = 0;
        if(!left)
            left = 0;
        if(!rotate)
            rotate = 0;
        if(!z)
            z = 10;

        TrelloApi.post("cards/"+this.id()+"/stickers/?image="+encodeURIComponent(sticker)+"&top="+parseInt(top)+"&left="+parseInt(left)+"&rotate="+parseInt(rotate)+"&zIndex="+parseInt(z));
        return this;
    }
    
    /**
    * Remove all stickers from a card
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).card().removeAllStickers();
    */
    this.removeAllStickers = function()
    {
        new IterableCollection(TrelloApi.get("cards/"+this.id()+"/stickers")).each(function(sticker)
        {
            TrelloApi.del("cards/"+this.id()+"/stickers/"+sticker.id);
        }.bind(this));
        return this;
    }

    /**
    * Reset cached objects and load data from Trello.
    * You may find this is required sometimes to force
    * a reload of an object, but you shouldn't use this
    * habitually.
    * @memberof module:TrelloEntities.Card
    * @example
    * new Notification(posted).card().load().currentList();
    */
    this.load = function()
    {
        this.checklist_list  = null;
        this.labels_list     = null;
        this.members_list    = null;
        this.moved_to_list_cache = null;

        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
        {
            if(!this.current_list && !this.containing_board)
                throw new InvalidRequestException("Can't load a card without a list ID and a board ID");
            else if(!this.current_list && this.containing_board)
            {
                this.current_list = this.containing_board.lists().find(function(list)
                {
                    try
                    {
                        list.cards().find(function(card)
                        {
                            if(card.id() == this.id())
                                return card;
                            else
                                return false;
                        }.bind(this)).first();
                        return list;
                    }
                    
                    catch(e)
                    {
                        Notification.expectException(InvalidDataException,e);
                        return false;
                    }
                }.bind(this)).first().setBoard(this.containing_board);
            }
            
            this.data = WekanApi.get('boards/'+this.current_list.board().id()+'/lists/'+this.current_list.id()+'/cards/'+this.id());
        }
        
        else
        {
            this.current_list = null;
            this.containing_board = null;
            var attempt = this.data.id;
            this.data = TrelloApi.get("cards/"+this.data.id+"?fields=all&actions=all&attachments=true&attachment_fields=all&members=true&member_fields=all&memberVoted_fields=all&checklists=all&checklist_fields=all&board=true&board_fields=all&list=true&pluginData=true&stickers=true&sticker_fields=all");
        }
      

        if(!this.data)
            throw new InvalidDataException("Unable to load card with id: "+attempt);

        return this;
    }


    //DEPRECATED
    this.completeAllItemsOnChecklist = function(name)
    {
        this.checklist(name).markAllItemsComplete();
        return this;
    }

    
    if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
    {
        if(!this.data['_id'] && this.data.link)
        {
            var bsplit = this.data.link.split("/b/");
            var usplit = bsplit[1].split("/");
            var board_id = usplit[0];
            var card_id = usplit[2];

            this.data['_id'] = card_id;
            this.setContainingBoard(new Board({id: board_id}));
            this.load();
        }
    }

    else
    {
        if(!this.data.id && this.data.link)
        {
            this.data.id = TrelloApi.cardLinkRegExp().exec(this.data.link)[1];
            this.load();
        }
    }
}

/**
* Create a new card in the given list with the
* given name, or key/value pairs in an object, using
* parameters from {@link https://developers.trello.com/reference/#cards-2}
* @memberof module:TrelloEntities.Card
* @param list {List} a List to add the card to 
* @param data {string|Object} either a card name to use 
* or an Object of key/value pairs
* @example
* Card.create(new Trellinator().board("Some Board").list("ToDo"),"Hi there!");
* @example
* Card.create(new Trellinator().board("Some Board").list("ToDo"),{name: "Hi there!",pos:"top"});
*/
Card.create = function(list,data,pos)
{
  if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
  {
      if(typeof data === "string")
      {
          var data = {
              title: data,
              description: "",
              authorId: WekanApi.login().id,
              swimlaneId: list.board().defaultSwimlane().id()
          };
      }
      
      else if(data && data.description)
      {
          if(data.description.length > 16384)
              data.description = data.description.substring(0,16381)+"...";
      }
      
      var ret = new Card(WekanApi.post('boards/'+list.board().id()+'/lists/'+list.id()+'/cards',data)).setCurrentList(list);
  }

  else
  {
      if(typeof data === "string")
      {
        data = {name: data};
        
        if(!pos)
            pos = "top";
        
        data.pos = pos;
      }
    
      else if(data && data.desc)
      {
          if(data.desc.length > 16384)
              data.desc = data.desc.substring(0,16381)+"...";
      }
      
      var ret = new Card(TrelloApi.post("cards?idList="+list.id()+"&"+new IterableCollection(data).implode("&",encodeURIComponent))).setCurrentList(list);
  }

  list.card_list = null;
  return ret;
}

/**
* Find a card or create it if it doesn't already with
* either just a string name, or an Object with key/value
* pairs from {@link https://developers.trello.com/reference/#cards-2}
* exist, in the given list. The card can exist anywhere
* on the same board as the target list, but will be created
* in the target list if it doesn't exist.
* @memberof module:TrelloEntities.Card
* @param list {List} a List object to find or create the card in
* @param data {string|Object} either the name of the card, or an Object
* with at least a name attribute to be used to find the card, and then
* data to be used when creating the card
* @example
* Card.findOrCreate(new Trellinator().board("My Board").list("Inbox"),"New Card Name");
*/
Card.findOrCreate = function(list,data)
{
    try
    {
        var ret = list.board().card(data);
    }
    
    catch(e)
    {
        Notification.expectException(InvalidDataException,e);
        var ret = Card.create(list,data);
    }
    
    return ret;
}
