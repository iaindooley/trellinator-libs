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
* that you're better off putting a try/catch
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
  this.containing_team = null;
  this.custom_fields_enabled = false;
        this.custom_fields     = null;

    /**
    * Return the board ID
    * @memberof module:TrelloEntities.Board
    * @example
    * new Notification(posted).board().id();
    */
    this.id = function()
    {
        return this.data.id;
    }

    /**
    * Return the board name
    * @memberof module:TrelloEntities.Board
    * @example
    * new Notification(posted).board().name();
    */
    this.name = function()
    {
        if(!this.data.name)
            this.load();
        
        return this.data.name;
    }
    
    /**
    * Set the containing team
    */
    this.setContainingTeam = function(team)
    {
      this.containing_team = team;
      return this;
    }
    
    /**
    * Move this board to a different team
    * @memberof module:TrelloEntities.Board
    * @example
    * new Notification(posted).board().moveToTeam(new Trellinator().team("New Team"));
    */
    this.team = function()
    {
      if(!this.containing_team)
      {
          if(!this.data.idOrganization)
              this.load();

          if(this.data.idOrganization)
              this.containing_team = new Team({id: this.data.idOrganization});
          else
              throw new InvalidDataException("This Board does not belong to a team");
      }

      return this.containing_team;
    }

    /**
    * Move this board to a different team
    * @memberof module:TrelloEntities.Board
    * @example
    * new Notification(posted).board().moveToTeam(new Trellinator().team("New Team"));
    */
    this.moveToTeam = function(team)
    {
      if(this.containing_team)
      {
          this.containing_team.board_list = null;
          this.containing_team = team;
          this.data.idOrganization = team.id();
      }

      TrelloApi.put("boards/"+this.id()+"?idOrganization="+team.id());
      return this;
    }

    /**
    * Make this a personal board (remove from any team)
    * will not effect membership of the board
    * DEPRECATED: Looks like personal boards aren't allowd in Trello anymore
    * @memberof module:TrelloEntities.Board
    * @example
    * new Notification(posted).board().makePersonal();
    */
    this.makePersonal = function()
    {
      if(this.containing_team)
          this.containing_team.board_list = null;

      this.containing_team = null;
      this.data.idOrganization = "";
      TrelloApi.put("boards/"+this.id()+"?idOrganization=");
      return this;
    }
    
    /**
    * Change the name of the board
    * @memberof module:TrelloEntities.Board
    * @param name {string} the new name for the board
    * @example
    * new Notification(posted).board().setName("New Name");
    */
    this.setName = function(name)
    {
       return this.rename(name);
    }

    /**
    * Return the link to this board
    * @memberof module:TrelloEntities.Board
    * @example
    * card.attachLink(new Notification(posted).board().link());
    */
    this.link = function()
    {
        return this.shortUrl();
    }

    /**
    * Return the short ID to this board
    * @memberof module:TrelloEntities.Board
    * @example
    * card.attachLink(new Notification(posted).board().shortId());
    */
    this.shortId = function()
    {
        return this.link().replace("https://trello.com/b/","")
    }
  
    /**
    * Fetch a member of the board by 
    * name
    * @memberof module:TrelloEntities.Board
    * @param name {string|RegExp} a string or regex to match to a member.
    * Will only return one member, ie. the first matching the name or regex.
    * @example
    * card.addMember(new Notification(posted).board().member("iaindooley"));
    */
    this.member = function(name)
    {
        return this.members(name).first();
    }

    /**
    * Fetch a list of members, optionally filtered by
    * name or regex
    * @memberof module:TrelloEntities.Board
    * @param name {string|RegExp} an optional filter to restrict
    * the list of members returned by username
    * @example
    * new Notification(posted).board().members().each(function(member)
    * {
    *     card.addMember(member);
    * });
    */
    this.members = function(name)
    {
        if(!this.members_list)
        {
            this.members_list = new IterableCollection(TrelloApi.get("boards/"+this.data.id+"/members?fields=fullName,username")).transform(function(elem)
                                {
                                    return new Member(elem);
                                });
        }

        return this.members_list.findByName(name);
    }
    
    /**
    * Return a Label from this board by name (or regex match)
    * @memberof module:TrelloEntities.Board
    * @param name {string|RegExp} the name or a regex of label
    * to return
    * @example
    * card.addLabel(new Notification(posted).board().label("Urgent"));
    */
    this.label = function(name)
    {
        return this.labels(name).first();
    }

    /**
    * Return all labels from this board, optionally filtered by
    * name (or matching regex)
    * @memberof module:TrelloEntities.Board
    * @param name {string|RegExp} the name or regex to use when
    * filtering the labels
    * @example
    * new Notification(posted).board().labels(new RegExp("Process.*")).each(function(label)
    * {
    *     card.addLabel(label);
    * });
    */
    this.labels = function(name)
    {
        if(!this.labels_list)
        {
            this.labels_list = new IterableCollection(TrelloApi.get("boards/"+this.data.id+"/labels?fields=id,name&limit=1000")).transform(function(elem)
                               {
                                   return new Label(elem);
                               });
        }
      
        return this.labels_list.findByName(name);
    }

    /**
    * Return a List from this board by name (or RegExp)
    * @memberof module:TrelloEntities.Board
    * @param name {string|RegExp} a list name or regex to match
    * will just return the first matching list
    * @example
    * new Notification(posted).board().list("ToDo").cards().each(function(card)
    * {
    *     card.postComment("@board Get 'er done!");
    * }
    */
    this.list = function(name)
    {
        return this.lists(name).first();
    }

    /**
    * Return all List objects from this board
    * optionally filtered by name/regex
    * @memberof module:TrelloEntities.Board
    * @param name {string|RegExp} a name or regex to filter the list by
    * @example
    * new Notification(posted).board().lists(new RegExp("A.*")).each().function(list)
    * {
    *     try
    *     {
    *         list.cards().first().postComment("@board me first!");
    *     }
    *
    *     catch(e)
    *     {
    *         Notification.expectException(InvalidDataException,e);
    *         Card.create(list,{name: "There must be at least one"}).postComment("@board me first!");
    *     }
    * });
    */
    this.lists = function(name)
    {
        if(!this.list_of_lists)
        {
            this.list_of_lists = new IterableCollection(TrelloApi.get("boards/"+this.data.id+"/lists?cards=none&card_fields=none&filter=open&fields=all")).transform(function(elem)
                                 {
                                     return new List(elem).setBoard(this);
                                 }.bind(this));
        }
      
        return this.list_of_lists.findByName(name);
    }

    /**
    * Get a single card from the board matched by name
    * or regex
    * @memberof module:TrelloEntities.Board
    * @param name {string|RegExp} the name or regex to match
    * if more than one card matches, will just reeturn the first
    * @example
    * new Notification(posted).board().card(new RegExp("Finders.*")).postComment("Keepers");
    */
    this.card = function(name)
    {
        return this.cards(name).first();
    }

    /**
    * Get an IterableCollection of Card objects on this board
    * optionally filtered by name (or by regex)
    * @memberof module:TrelloEntities.Board
    * @param name {string|RegExp} a string or RegExp to restrict
    * the cards returned
    * @example
    * new Notification(posted).board().id();
    */
    this.cards = function(name)
    {
        if(!this.card_list)
        {
            this.card_list = new IterableCollection(TrelloApi.get("boards/"+this.data.id+"/cards?fields=id,name")).transform(function(card)
            {
                return new Card(card).setContainingBoard(this);
            }.bind(this));
        }

        return this.card_list.findByName(name);
    }
    
    /**
    * Find an existing list, creating it if it doesn't exist
    * @memberof module:TrelloEntities.Board
    * @param name {string} the name of the list to find, creating it if it doesn't exist
    * @param pos {string} (optional) either "bottom" or "top" where "bottom" is furthest
    * to the right of the window and "top" is furthest to the left
    * Card.create(new Notification(posted).board().findOrCreateList("ToDo"),{name: "Do this!"});
    * @example
    * Card.create(new Notification(posted).board().findOrCreateList("ToDo"),{name: "Hi there!"});
    */
    this.findOrCreateList = function(name,pos)
    {      
      try
      {
        var list = this.list(name);
      }
      
      catch(e)
      {
          Notification.expectException(InvalidDataException,e);
          var list = this.createList(name,pos);
      }
      
      return list;
    }

    /**
    * Create a list even if a list with the same name
    * already exists
    * @memberof module:TrelloEntities.Board
    * @param name {string} the name of the list to find, creating it if it doesn't exist
    * @param pos {string} (optional) either "bottom" or "top" where "bottom" is furthest
    * to the right of the window and "top" is furthest to the left
    * Card.create(new Notification(posted).board().createList("ToDo"),{name: "Do this!"});
    * @example
    * Card.create(new Notification(posted).board().createList("ToDo"),{name: "Hi there!"});
    */
    this.createList = function(name,pos)
    {
        if(!pos)
            pos = "top";

        var list = new List(TrelloApi.post("lists?name="+encodeURIComponent(name)+"&idBoard="+this.data.id+"&pos="+pos));
        this.list_of_lists = null;
        return list;
    }
    
    /**
    * Create a new board by copying this one
    * into a team, preserving members
    * @memberof module:TrelloEntities.Board
    * @param name {string} the name for the new board
    * @param team {Team} optional - a Team object to add this board to.
    * All boards must now be members of a team in Trello, so if this is not provided
    * default to new Trellinator().teams().first().id()
    * @param permission {string} optional - org, private, public (defaults to "org")
    * @param no_members {string} optional - true if you don't want to invite members
    * from the template board
    * @example
    * var trellinator = new Trellinator();
    * trellinator.board("My Template").copy("My Project",trellinator.team("Some Team"));
    */
    this.copy = function(name,team,permission,no_members)
    {
        var teamstr = "";
        var permstr = "";

        if(permission)
            permstr = "&prefs_permissionLevel="+permission;
        else
            permstr = "&prefs_permissionLevel=org";


        if(team)
            teamstr = "&idOrganization="+team.data.id;
        else
        {
            try
            {
                team_id = new Trellinator().teams().first().id();
            }
            
            catch(e)
            {
                Notification.expectException(InvalidDataException,e);
                team_id = new Trellinator().team("My New Free Team").id();
            }

            teamstr = "&idOrganization="+team_id;
        }

        var new_board = new Board(TrelloApi.post("/boards/?name="+encodeURIComponent(name)+teamstr+"&idBoardSource="+this.data.id+"&keepFromSource=cards"+permstr+"&prefs_voting=disabled&prefs_comments=members&prefs_invitations=members&prefs_selfJoin=true&prefs_cardCovers=true&prefs_background=blue&prefs_cardAging=regular"));
        
        if(!no_members)
        {
            this.members().each(function(elem)
            {
                new_board.addMember(elem);
            }.bind(this));
        }
        
        return new_board;
    }

    /**
    * Add a member to the board by email address
    * @memberof module:TrelloEntities.Board
    * @param email {string} the email of the user to invite (can be new or existing Trello user)
    * @param type {string} admin or normal, defaults to admin
    * @example
    * new Notification(posted).board().inviteMemberByEmail("user@example.org");
    */
    this.inviteMemberByEmail = function(email,type)
    {
        if(!type)
          type = "admin";
      
        TrelloApi.put("boards/"+this.data.id+"/members/?email="+encodeURIComponent(email)+"&type="+type);
        this.members_list  = null;
        return this;
    }
    
    /**
    * Add a Trello member to a board
    * @memberof module:TrelloEntities.Board
    * @param member {Member} a Member object to add to this board
    * @param type {string} admin or normal, defaults to admin
    * @example
    * new Trellinator().board("Some Board").addMember(new Notification(posted).member());
    */
    this.addMember = function(member,type)
    {
        if(!type)
          type = "admin";
      
        TrelloApi.put("boards/"+this.data.id+"/members/"+member.username()+"?type="+type);
        this.members_list  = null;
        return this;
    }

    /**
    * Remove a Trello member from a board
    * @memberof module:TrelloEntities.Board
    * @param member {Member} a Member object to remove from this board
    * @example
    * new Trellinator().board("Some Board").removeMember(new Notification(posted).member());
    */
    this.removeMember = function(member)
    {
        TrelloApi.del("boards/"+this.data.id+"/members/"+member.username());
        this.members_list  = null;
        return this;
    }

    /**
    * Archive this board
    * @memberof module:TrelloEntities.Board
    * @example
    * new Notification(posted).board().del();
    */
    this.archive = function()
    {
        return TrelloApi.put("boards/"+this.data.id+"?closed=true");
    }

    /**
    * Unarchive this board
    * @memberof module:TrelloEntities.Board
    * @example
    * new Notification(posted).board().del();
    */
    this.unArchive = function()
    {
        return TrelloApi.put("boards/"+this.data.id+"?closed=false");
    }

    /**
    * Delete this board
    * @memberof module:TrelloEntities.Board
    * @example
    * new Notification(posted).board().del();
    */
    this.del = function()
    {
        return TrelloApi.del("boards/"+this.data.id);
    }

    /**
    * Clear cached data and load via API call again.
    * This may be required sometimes if you have modified
    * data on a board and need to reload it. This method
    * can be chained so it's easy to stick a load() call
    * in where you need one, but shouldn't be done habitually
    * to reduce the total number of API calls you need
    * to make
    * @memberof module:TrelloEntities.Board
    * @example
    * new Notification(posted).board().load().lists();
    */
    this.load = function()
    {
        this.list_of_lists = null;
        this.members_list  = null;
        this.labels_list   = null;
        this.card_list     = null;
        this.custom_fields     = null;
        this.custom_fields_enabled     = null;
        this.data = TrelloApi.get("boards/"+this.data.id+"?actions=none&boardStars=none&cards=none&checklists=none&fields=name%2Cdesc%2CdescData%2Cclosed%2CidOrganization%2Curl%2CshortUrl&lists=none&members=none&memberships=none&membersInvited=none");
        return this;
    }

    /**
    * Return a list of custom fields
    * @memberof module:TrelloEntities.Board
    * @example
    * new Notification(posted).board().customFields().first().name();
    */
    this.customFields = function()
    {
        this.enableCustomFields();
        return new IterableCollection(TrelloApi.get("boards/"+this.id()+"/customFields")).find(function(field)
        {
            return new CustomField(field);
        });
        
    }

    //INTERNAL
    this.findOrCreateCustomFieldFromName = function(field_name)
    {
        this.enableCustomFields();

        if(!this.custom_fields)
            this.custom_fields = new IterableCollection(TrelloApi.get("boards/"+this.id()+"/customFields"));

        var field = null;
        this.custom_fields.each(function(loop)
                                { 
                                    if(loop.name == field_name)
                                        field = loop;
                                });

        if(field === null)
        {
            var url = "https://api.trello.com/1/customFields";

            var payload = {
                idModel: this.id(),
                modelType: "board",
                name: field_name,
                pos: "bottom",
                type: "text",
                display_cardFront: CustomField.DEFAULT_CARDFRONT_DISPLAY,
                key: TrelloApi.checkControlValues().key,
                token: TrelloApi.checkControlValues().token
              };

            var field = HttpApi.call("post",url,"",{"content-type": "application/json"},JSON.stringify(payload));

            if(!field.id)
                throw "Unable to create custom field: "+field_name+" response: "+JSON.stringify(field);
            
            this.custom_fields = null;
        }

        return field;
    }

    //INTERNAL
    this.enableCustomFields = function()
    {
        if(!this.custom_fields_enabled)
        {
          var enabled = false;
          
            new IterableCollection(TrelloApi.get("boards/"+this.id()+"/plugins?filter=enabled")).each(function(loop)
            {   
                if(loop.name == "Custom Fields")
                    enabled = true;
            }.bind(this));
    
            if(!enabled)
            {   
                new IterableCollection(TrelloApi.get("boards/"+this.id()+"/plugins?filter=available")).each(function(loop)
                {   
                    if(loop.name == "Custom Fields")
                    {
                        var resp = TrelloApi.post("boards/"+this.id()+"/boardPlugins?idPlugin="+loop.id);
    
                        if(resp.error)
                            throw "Unable to enable Custom Fields power up to find or create custom field from name because: "+resp.error;
                    }
                }.bind(this));
            }
            
            this.custom_fields_enabled = true;
        }
    }

    //DEPRECATED: use setName
    this.rename = function(name)
    {
        TrelloApi.put("boards/"+this.data.id+"?name="+encodeURIComponent(name));
        this.data.name = name;
        return this;
    }

    //DEPRECATED: use link()
    this.shortUrl = function()
    {
        if(!this.data.shortUrl)
            this.load();
        
        return this.data.shortUrl;
    }

    //DEPRECATED: use List.moveAllCards
    this.moveAllCards = function(from_list,to_list)
    {
        var ret = new IterableCollection(TrelloApi.post("lists/"+from_list.id()+"/moveAllCards?idBoard="+to_list.board().id()+"&idList="+to_list.id()));
        
        ret.transform(function(elem)
        {
            return new Card(elem);
        });
        
        from_list.card_list = null;
        to_list.card_list = null;
        return ret;
    }

    if(!this.data.id && this.data.link)
    {   
        this.data.id = TrelloApi.boardLinkRegExp().exec(this.data.link)[1];
        this.load();
    }
}

/**
* Create a new board from an object containing key/value pairs. The minimum
* required is "name", with other options available at {@link https://developers.trello.com/reference/#boardsid}
* 
* If you are creating a new board from a template, you might prefer to
* use the Board.copy() method instead
* @memberof module:TrelloEntities.Board
* @param data {Object} an object containing key/value pairs for all the fields
* @example
* Board.create({name: "Hi there!"});
*/
Board.create = function(data)
{
    if(typeof data === "string")
        data = {name: data};
    
    if(!data.idOrganization)
        data.idOrganization = new Trellinator().teams().first().id();

    return new Board(TrelloApi.post("boards/?"+new IterableCollection(data).implode("&",encodeURIComponent)));
}

/**
* Find a board by name if it already exists, or create
* one if it doesn't. The data you pass in can either
* be a string, or an array of key/value pairs at least
* containing a name. If a board with the name already 
* exists it will be returned, otherwise a board will be
* created using all the data you provide
* @memberof module:TrelloEntities.Board
* @param data {string|Object} either a board name or an
* object of key/value pairs at least containing name
* @param global_command_group {string} (optional) a global command group
* to add the board to if a new one is created
* @example
* Card.create(Board.findOrCreate("New Board").findOrCreateList("ToDo"),{name: "Hi there!"});
* @example
* Board.findOrCreate({name: "Hi there!",idOrganization: new Trellinator().team("Some Team").id()});
*/
Board.findOrCreate = function(data,global_command_group)
{
    try
    {
        return new Trellinator().board(data);
    }
    
    catch(e)
    {
        Notification.expectException(InvalidDataException,e);
        var ret = Board.create(data);
        
        if(global_command_group)
            Trellinator.addBoardToGlobalCommandGroup(ret,global_command_group);

        return ret;
    }
}
