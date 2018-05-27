var Board = function(data)
{    
    this.data          = data;
    this.list_of_lists = null;

    this.name = function()
    {
        if(!this.data.name)
            this.load();
        
        return this.data.name;
    }
    
    this.rename = function(name)
    {
        TrelloApi.put("boards/"+this.data.id+"?name="+encodeURIComponent(name));
        return this.load();
    }
    
    this.link = function()
    {
        return this.shortUrl();
    }

    this.shortUrl = function()
    {
        if(!this.data.shortUrl)
            this.load();
        
        return this.data.shortUrl;
    }
  
    this.moveAllCards = function(data)
    {
        //data.from == RegExp, data.to == RegExp
        var lists = TrelloApi.get("boards/"+this.data.id+"/lists?cards=none&card_fields=none&filter=open&fields=all");
        var from_list = null;
        var to_list = null;

        for(var key in lists)
        {
            if(TrelloApi.nameTest(data.from,lists[key].name))
                from_list = lists[key];
            else if(TrelloApi.nameTest(data.to,lists[key].name))
                to_list = lists[key];
        }
        
        var ret = new IterableCollection(TrelloApi.post("lists/"+from_list.id+"/moveAllCards?idBoard="+to_list.idBoard+"&idList="+to_list.id));
        
        ret.transform(function(elem)
        {
            return new Card(elem);
        });
        
        return ret;
    }
    
    this.member = function(data)
    {
        return this.members(data).first();
    }

    this.members = function(data)
    {
        return this.iterableCollection("boards/"+this.data.id+"/members?fields=fullName,username",
                                       data,
                                       function(elem)
                                       {
                                           return new Member(elem);
                                       });
    }
    
    this.label = function(data)
    {
        return this.labels(data).first();
    }

    this.labels = function(data)
    {
        return this.iterableCollection("boards/"+this.data.id+"/labels?fields=id,name&limit=1000",
                                       data,
                                       function(elem)
                                       {
                                           return new Label(elem);
                                       });
    }

    this.list = function(data)
    {
        return this.lists().findByName(TrelloApi.nameTestData(data)).first();
    }

    this.lists = function(data)
    {
        if(!this.list_of_lists)
        {
            this.list_of_lists = new IterableCollection(TrelloApi.get("boards/"+this.data.id+"/lists?cards=none&card_fields=none&filter=open&fields=all"))
                                 .transform(function(elem)
                                 {
                                     return new List(elem);
                                 });
        }
      
        if(filter = TrelloApi.nameTestData(data))
            var ret = this.list_of_lists.findByName(filter);
        else
            var ret = this.list_of_lists;

        return ret;
    }

    this.iterableCollection = function(url,data,callback)
    {
        var ret = new IterableCollection(TrelloApi.get(url));
        ret.transform(callback);
        ret.filterByName(TrelloApi.nameTestData(data));   
        return ret;
    }

    this.card = function(data)
    {
        return this.cards().findByName(TrelloApi.nameTestData(data)).first();
    }

    this.cards = function(data)
    {
        var cards = new IterableCollection(TrelloApi.get("boards/"+this.data.id+"/cards?fields=id,name"));

        cards.transform(function(card)
        {
            return new Card(card);
        });
        
        var ret = cards.findByName(TrelloApi.nameTestData(data));
        return ret;
    }
    
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
    
    this.copy = function(name,team)
    {
        var new_board = new Board(TrelloApi.post("/boards/?name="+encodeURIComponent(name)+"&idOrganization="+team.data.id+"&idBoardSource="+this.data.id+"&keepFromSource=cards&prefs_permissionLevel=org&prefs_voting=disabled&prefs_comments=members&prefs_invitations=members&prefs_selfJoin=true&prefs_cardCovers=true&prefs_background=blue&prefs_cardAging=regular"));
        
        this.members().each(function(elem)
        {
            new_board.addMember(elem);
        }.bind(this));
        
        return new_board;
    }

    this.inviteMemberByEmail = function(email)
    {
        TrelloApi.put("boards/"+this.data.id+"/members/?email="+encodeURIComponent(email)+"&type=normal");
        return this;
    }
    
    this.addMember = function(member)
    {
        TrelloApi.put("boards/"+this.data.id+"/members/"+member.username()+"?type=admin");
        return this;
    }

    this.load = function()
    {
        this.data = TrelloApi.get("boards/"+this.data.id+"?actions=none&boardStars=none&cards=none&checklists=none&fields=name%2C%20desc%2C%20descData%2C%20closed%2C%20idOrganization%2C%20url%2C%20shortUrl&lists=none&members=none&memberships=none&membersInvited=none");
        return this;
    }

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

Board.create = function(data)
{
    return new Board(TrelloApi.post("boards/?"+new IterableCollection(data).implode("&",encodeURIComponent)));
}

