/**
* @class Member
* @memberof module:TrelloEntities
* @constructor
*/
var Member = function(data)
{    
    this.data = data;
    this.list_of_teams = null;
    this.board_list  = null;
  
    /**
    * Ohai there
    * @memberof module:TrelloEntities.Member
    * @example
    * new Notification(posted).board().id();
    */
    this.id = function()
    {
        return this.data.id;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Member
    * @example
    * new Notification(posted).board().id();
    */
    this.notTrellinator = function()
    {
        return (new Trellinator().name() != this.name());
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Member
    * @example
    * new Notification(posted).board().id();
    */
    this.fullName = function()
    {
        if(!this.data.fullName)
            this.load();

        return this.data.fullName;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Member
    * @example
    * new Notification(posted).board().id();
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
    * Ohai there
    * @memberof module:TrelloEntities.Member
    * @example
    * new Notification(posted).board().id();
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
    * Ohai there
    * @memberof module:TrelloEntities.Member
    * @example
    * new Notification(posted).board().id();
    */
    this.username = function()
    {
        return this.name();
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Member
    * @example
    * new Notification(posted).board().id();
    */
    this.name = function()
    {
        if(!this.data.username)
            this.load();

        return this.data.username;
    }
    
    /**
    * Ohai there
    * @memberof module:TrelloEntities.Member
    * @example
    * new Notification(posted).board().id();
    */
    this.load = function()
    {
        this.list_of_teams = null;
        this.board_list  = null;

        if(this.data.id)
            var toload = this.data.id;
        else if(this.data.username)
            var toload = this.data.username;
        else
            throw new Error("You have to pass in either an ID or a username to a new Member");

        this.data = TrelloApi.get("members/"+toload+"?fields=id,username,fullName");
        return this;
    }
    
    /**
    * Ohai there
    * @memberof module:TrelloEntities.Member
    * @example
    * new Notification(posted).board().id();
    */
    this.board = function(data)
    {
        return this.boards(data).first();
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Member
    * @example
    * new Notification(posted).board().id();
    */
    this.boards = function(data)
    {
        if(!this.board_list)
        {
            this.board_list = new IterableCollection(TrelloApi.get("members/"+this.username()+"/boards?filter=open&fields=all&lists=open&memberships=none&organization_fields=name%2CdisplayName")).transform(function(elem)
                              {
                                  return new Board(elem);
                              });
        }
        
        return this.board_list.findByName(data);
    }

    if(!this.data.id && this.data.username)
    {
        if(Member.mock_member_username)
            this.data.username = Member.mock_member_username;

        this.load();
    }
}

/**
* Ohai there
* @memberof module:TrelloEntities.Member
* @example
* new Notification(posted).board().id();
*/
Member.mock_member_username = null;
