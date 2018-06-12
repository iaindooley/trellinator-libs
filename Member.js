var Member = function(data)
{    
    this.data = data;
    this.list_of_teams = null;
    this.board_list  = null;
  
    this.id = function()
    {
        return this.data.id;
    }

    this.notTrellinator = function()
    {
        return (new Trellinator().name() != this.name());
    }

    this.fullName = function()
    {
        if(!this.data.fullName)
            this.load();

        return this.data.fullName;
    }

    this.team = function(name)
    {
        return this.teams(name).first();
    }
    
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

    this.username = function()
    {
        return this.name();
    }

    this.name = function()
    {
        if(!this.data.username)
            this.load();

        return this.data.username;
    }
    
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
    
    this.board = function(data)
    {
        return this.boards(data).first();
    }

    this.boards = function(data)
    {
        if(!this.board_list)
        {
            this.board_list = new IterableCollection(TrellApi.get("members/"+this.username()+"/boards?filter=open&fields=all&lists=open&memberships=none&organization_fields=name%2CdisplayName")).transform(function(elem)
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

Member.mock_member_username = null;
