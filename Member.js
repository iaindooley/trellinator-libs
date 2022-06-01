/**
* @class Member
* @memberof module:TrelloEntities
* @param data (Object} key/value pairs of 
* information, must at least contain "id"
* or a "username", but can basically just
* pass in response from Trello API
* @constructor
* @classdesc The Member class represents
* a Member in Trello. 
*
* You will usually deal with Member as part of an
* IterableCollection or returned from Board and
* Card methods, however the Trellinator class is a 
* special instance of Member, so when you do
* new Trellinator() the object you get back inherits
* all the behaviour of Member.
*
* @example
* card.members().first().name();
* @example
* new Trellinator().board("Some Board");
* @example
* new Trellinator().team("Some Team");
* @example
* new Member({username: "iaindooley"});
*/
var Member = function(data)
{    
    //allow Trello style IDs
    if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
        data['userId'] = data['userId'] || data.id;

    this.data = data;
    this.list_of_teams = null;
    this.board_list  = null;
    this.containing_card  = null;
  
    /**
    * Return the id of this Member
    * @memberof module:TrelloEntities.Member
    * @example
    * card.members().first().id();
    */
    this.id = function()
    {
        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
            return this.data.userId || this.data.username;
        else
            return this.data.id;
    }

    //INTERNAL
    this.setContainingCard = function(card)
    {
        this.containing_card = card;
        return this;
    }
    
    /**
    * If a containing card has been set, return it
    * otherwise throw InvalidDataException
    * @memberof module:TrelloEntities.Member
    * @example
    * new Notification(notification)
    * .addedMemberToCard()
    * .card()
    * .postComment("Member added to me");
    */
    this.card = function()
    {
        if(!this.containing_card)
            throw new InvalidDataException("No containing card set");
        
        return this.containing_card;
    }
    
    /**
    * Fetch a custom sticker by name
    * @memberof module:TrelloEntities.Member
    * @example
    * card.members().first().id();
    */
    this.customSticker = function(name)
    {
        return this.customStickers().find(function(sticker)
        {
          if(sticker.url.indexOf("/"+name.replace(/ /g,"_")+".png") > -1)
            return sticker;
          else
            return false;
        }).first();
    }

    /**
    * Fetch a list of custom sticker IDs
    * for use with the Card.addSticker method
    * @memberof module:TrelloEntities.Member
    * @example
    * new Trellinator().customStickers();
    */
    this.customStickers = function(name)
    {
        return new IterableCollection(TrelloApi.get("members/"+this.name()+"/customStickers"));
    }

    /**
    * If this member is NOT the Trellinator
    * member, useful for excluding functionality
    * when a notification is caused by an 
    * action performed by Trellinator
    * @memberof module:TrelloEntities.Member
    * @example
    * var notif = new Notification(posted);
    * 
    * if(notif.member().notTrellinator())
    *     notif.replyToMember("Your wish is my command!");
    */
    this.notTrellinator = function()
    {
        return (new Trellinator().name() != this.name());
    }

    /**
    * Return the full name of this Member
    * @memberof module:TrelloEntities.Member
    * @example
    * var notif = new Notification(posted);
    * notif.replyToMember("Your name is: "+notif.member().fullName());
    */
    this.fullName = function()
    {
        if(!this.data.fullName)
            this.load();

        return this.data.fullName;
    }

    /**
    * Return a team this member has access
    * to, or create a new team if one doesn't exist
    * @memberof module:TrelloEntities.Member
    * @param name {string} the team name
    * @example
    * new Trellinator().team("New or Existing Team");
    */
    this.team = function(name)
    {
        var ret = null;

        try
        {
            ret = this.teams(name).first();
        }
        
        catch(e)
        {
            Notification.expectException(InvalidDataException,e);
            ret = new Team(TrelloApi.post("organizations?displayName="+encodeURIComponent(name)));
        }
        
        return ret;
    }
    
    /**
    * Return an IterableCollection of Teams this 
    * Member has access to, optionally filtered by
    * a string/regex
    * @memberof module:TrelloEntities.Member
    * @param name {string|RegExp} the string or RegExp to match with the
    * team names
    * @example
    * new Trellinator().teams(new RegExp("Internal.*"));
    */
    this.teams = function(name)
    {
        if(!this.list_of_teams)
        {
            this.list_of_teams = new IterableCollection(TrelloApi.get("/members/"+this.username()+"/organizations?filter=all&fields=all")).transform(function(elem)
                                 {
                                     return new Team(elem);
                                 });
        }
        
        return this.list_of_teams.findByName(name);
    }

    /**
    * Return the username of this Member
    * this is an alias of the name() method
    * @memberof module:TrelloEntities.Member
    * @example
    * card.members().first().username();
    */
    this.username = function()
    {
        return this.name();
    }

    /**
    * Return the username of this Member
    * @memberof module:TrelloEntities.Member
    * @example
    * card.members().first().name();
    */
    this.name = function()
    {
        if(!this.data.username)
            this.load();

        return this.data.username;
    }

    /**
    * Return a board this member 
    * has access to
    * @memberof module:TrelloEntities.Member
    * @param name {string|RegExp} a string or RegExp to 
    * match against the board names
    * @example
    * new Trellinator().board("My Personal Tasks");
    */
    this.board = function(name)
    {
        return this.boards(name).first();
    }

    /**
    * Return an IterableCollection of boards this
    * member has access to, filtered optionally
    * by name using a string or regex
    * @memberof module:TrelloEntities.Member
    * @param name {string|RegExp} a string or RegExp to 
    * match against the name of boards this member has
    * access to
    * @example
    * new Notification(posted).member().boards(new RegExp("Internal.*"));
    */
    this.boards = function(name)
    {
        if(!this.board_list)
        {
            this.board_list = new IterableCollection(TrelloApi.get("members/"+this.username()+"/boards?filter=open&fields=all&lists=open&memberships=none&organization_fields=name%2CdisplayName")).transform(function(elem)
                              {
                                  return new Board(elem);
                              });
        }
        
        return this.board_list.findByName(name);
    }
    
    //INTERNAL USE ONLY
    this.load = function()
    {
        this.list_of_teams = null;
        this.board_list  = null;

        if(this.id())
            var toload = this.id();
        else if(this.data.username)
            var toload = this.data.username;
        else
            throw new Error("You have to pass in either an ID or a username to a new Member");

        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
            this.data = WekanApi.get("users/"+toload);
        else
            this.data = TrelloApi.get("members/"+toload+"?fields=id,username,fullName");

        return this;
    }
    

    if(!this.data.id && this.data.username)
    {
        if(Member.mock_member_username)
            this.data.username = Member.mock_member_username;

        this.load();
    }
}

/**
* If you need to test adding a particular
* member by username to a card based on some
* action, you can use this mock_member_username
* to inject a different username to use when loading
* any member by username
* @memberof module:TrelloEntities.Member
* @example
* new Notification(posted).board().id();
*/
Member.mock_member_username = null;
