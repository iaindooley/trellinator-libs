/**
* The TrelloEntities module has all the classes
* that represent things like Boards, Lists and
* Cards in Trello. They are basically a wrapper
* for the Trello API but done in such as way as
* to loosely emulate the "plain english" style
* of Butler for Trello.
* 
* The TrelloEntities classes make heavy use of
* the {@link module:TrellinatorCore.IterableCollection}
* class for returning collections of entities
* and as such will usually throw {@link module:Exceptions.InvalidDataException}
* when the requested information does not exist.
* 
* Methods are designed to be "chainable" as 
* much as possible, and thus favour throwing
* exceptions over a "null return". This means
* that you're better of putting a try/catch
* block around a "fluent" chain of method
* calls rather than doing lots of "if this 
* then that" type of checking.

* @module TrelloEntities
* @example
* try
* {
*     //If the list, card or board don't exist
*     //an InvalidDataException will be thrown
*     new Trellinator.board("My Board")
*     .list("There or not?")
*     .card("Maybe I'm here ... ")
*     .postComment("@"+new Notification(posted).member().name()+" hi there!");
* }
*
* catch(e)
* {
*     Notification.expectException(InvalidDataException,e);
*     new Notification(posted).card().postComment("Something wasn't there ... ");
* }
*/

/**
* @class Board
* @memberof module:TrelloEntities
* @constructor
* @param data (Object} key/value pairs of 
* information, must at least contain "id",
* can basically just pass in response from Trello API
* @classdesc The Board class represents
* a Board in Trello. Every Notification will
* have a board object associated with it because
* all Trellinator webhooks are registered at the
* board level. When a Time Trigger function is
* added, the parameters passed into the function
* are simply a board id that can be passed 
* directly into the constructor for Board.
* 
* If you need to access another board, use the 
* Trellinator class to load it.
*
* @example
* //a Notification driven function
* function doSomething(notification)
* {
*     new Notification(notification)
*     .replyToMember("You are on: "+
*     new Notification(notification).board().name());
* }
* @example
* //get access to another board via Trellinator
* new Trellinator().board("Some Board");
* @example
* //a function executed from a Time Trigger
* //on a recurring basis
* function recurringFunction(params,signature,original_time)
* {
*     new Board(params).card("Search").postComment("It's that time again!");
*     ExecutionQueue.push("recurringFunction",
*                         params,
*                         signature,
*                         original_time.addDays(7).at("9:00"));
* }
*/
var Board = function(data)
{    
    this.data          = data;
    this.list_of_lists = null;
    this.members_list  = null;
    this.labels_list   = null;
    this.card_list     = null;

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Board
    * @example
    * new Notification(posted).board().id();
    */
    this.id = function()
    {
        return this.data.id;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Board
    * @example
    * new Notification(posted).board().id();
    */
    this.name = function()
    {
        if(!this.data.name)
            this.load();
        
        return this.data.name;
    }
    
    /**
    * Ohai there
    * @memberof module:TrelloEntities.Board
    * @example
    * new Notification(posted).board().id();
    */
    this.rename = function(name)
    {
        TrelloApi.put("boards/"+this.data.id+"?name="+encodeURIComponent(name));
        return this.load();
    }
    
    /**
    * Ohai there
    * @memberof module:TrelloEntities.Board
    * @example
    * new Notification(posted).board().id();
    */
    this.link = function()
    {
        return this.shortUrl();
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Board
    * @example
    * new Notification(posted).board().id();
    */
    this.shortUrl = function()
    {
        if(!this.data.shortUrl)
            this.load();
        
        return this.data.shortUrl;
    }
  
    /**
    * Ohai there
    * @memberof module:TrelloEntities.Board
    * @example
    * new Notification(posted).board().id();
    */
    this.moveAllCards = function(from_list,to_list)
    {
        var ret = new IterableCollection(TrelloApi.post("lists/"+from_list.id()+"/moveAllCards?idBoard="+to_list.board().id()+"&idList="+to_list.id()));
        
        ret.transform(function(elem)
        {
            return new Card(elem);
        });
        
        return ret;
    }
    
    /**
    * Ohai there
    * @memberof module:TrelloEntities.Board
    * @example
    * new Notification(posted).board().id();
    */
    this.member = function(data)
    {
        return this.members(data).first();
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Board
    * @example
    * new Notification(posted).board().id();
    */
    this.members = function(data)
    {
        if(!this.members_list)
        {
            this.members_list = new IterableCollection(TrelloApi.get("boards/"+this.data.id+"/members?fields=fullName,username")).transform(function(elem)
                                {
                                    return new Member(elem);
                                });
        }

        return this.members_list.findByName(data);
    }
    
    /**
    * Ohai there
    * @memberof module:TrelloEntities.Board
    * @example
    * new Notification(posted).board().id();
    */
    this.label = function(data)
    {
        return this.labels(data).first();
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Board
    * @example
    * new Notification(posted).board().id();
    */
    this.labels = function(data)
    {
        if(!this.labels_list)
        {
            this.labels_list = new IterableCollection(TrelloApi.get("boards/"+this.data.id+"/labels?fields=id,name&limit=1000")).transform(function(elem)
                               {
                                   return new Label(elem);
                               });
        }
        
        return this.labels_list.findByName(data);
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Board
    * @example
    * new Notification(posted).board().id();
    */
    this.list = function(data)
    {
        return this.lists(data).first();
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Board
    * @example
    * new Notification(posted).board().id();
    */
    this.lists = function(data)
    {
        if(!this.list_of_lists)
        {
            this.list_of_lists = new IterableCollection(TrelloApi.get("boards/"+this.data.id+"/lists?cards=none&card_fields=none&filter=open&fields=all")).transform(function(elem)
                                 {
                                     return new List(elem);
                                 });
        }
      
        return this.list_of_lists.findByName(data);
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Board
    * @example
    * new Notification(posted).board().id();
    */
    this.card = function(data)
    {
        return this.cards(data).first();
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Board
    * @example
    * new Notification(posted).board().id();
    */
    this.cards = function(data)
    {
        if(!this.card_list)
        {
            this.card_list = new IterableCollection(TrelloApi.get("boards/"+this.data.id+"/cards?fields=id,name")).transform(function(card)
            {
                return new Card(card);
            });
        }
        
        return this.card_list.findByName(data);
    }
    
    /**
    * Ohai there
    * @memberof module:TrelloEntities.Board
    * @example
    * new Notification(posted).board().id();
    */
    this.findOrCreateList = function(name,pos)
    {      
      if(!pos)
        pos = "top";
      
      try
      {
        var list = this.list({name: name});
      }
      
      catch(e)
      {
        var list = new List(TrelloApi.post("lists?name="+encodeURIComponent(name)+"&idBoard="+this.data.id+"&pos="+pos));
        this.list_of_lists = null;
      }
      
      return list;
    }
    
    /**
    * Ohai there
    * @memberof module:TrelloEntities.Board
    * @example
    * new Notification(posted).board().id();
    */
    this.copy = function(name,team)
    {
        var new_board = new Board(TrelloApi.post("/boards/?name="+encodeURIComponent(name)+"&idOrganization="+team.data.id+"&idBoardSource="+this.data.id+"&keepFromSource=cards&prefs_permissionLevel=org&prefs_voting=disabled&prefs_comments=members&prefs_invitations=members&prefs_selfJoin=true&prefs_cardCovers=true&prefs_background=blue&prefs_cardAging=regular"));
        
        this.members().each(function(elem)
        {
            new_board.addMember(elem);
        }.bind(this));
        
        return new_board;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Board
    * @example
    * new Notification(posted).board().id();
    */
    this.inviteMemberByEmail = function(email)
    {
        TrelloApi.put("boards/"+this.data.id+"/members/?email="+encodeURIComponent(email)+"&type=normal");
        return this;
    }
    
    /**
    * Ohai there
    * @memberof module:TrelloEntities.Board
    * @example
    * new Notification(posted).board().id();
    */
    this.addMember = function(member)
    {
        TrelloApi.put("boards/"+this.data.id+"/members/"+member.username()+"?type=admin");
        return this;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Board
    * @example
    * new Notification(posted).board().id();
    */
    this.load = function()
    {
        this.list_of_lists = null;
        this.members_list  = null;
        this.labels_list   = null;
        this.card_list     = null;
        this.data = TrelloApi.get("boards/"+this.data.id+"?actions=none&boardStars=none&cards=none&checklists=none&fields=name%2C%20desc%2C%20descData%2C%20closed%2C%20idOrganization%2C%20url%2C%20shortUrl&lists=none&members=none&memberships=none&membersInvited=none");
        return this;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Board
    * @example
    * new Notification(posted).board().id();
    */
    this.del = function()
    {
        return TrelloApi.del("boards/"+this.data.id);
    }

    if(!this.data.id && this.data.link)
    {   
        this.data.id = TrelloApi.boardLinkRegExp().exec(this.data.link)[1];
        this.load();
    }
}

/**
* Ohai there
* @memberof module:TrelloEntities.Board
* @example
* new Notification(posted).board().id();
*/
Board.create = function(data)
{
    return new Board(TrelloApi.post("boards/?"+new IterableCollection(data).implode("&",encodeURIComponent)));
}

/**
* If a board with the same name already exists
* return it, otherwise create a new board
*/
Board.findOrCreate = function(data)
{
    try
    {
        return new Trellinator().board(data.name);
    }
    
    catch(e)
    {
        Notification.expectException(InvalidDataException,e);
        return Board.create(data);
    }
}
