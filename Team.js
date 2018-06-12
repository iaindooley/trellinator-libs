var Team = function(data)
{    
    this.data       = data;
    this.board_list = null;

    this.id = function()
    {
        return this.data.id;
    }
  
    this.name = function()
    {
        if(!this.data.displayName)
            this.load();

        return this.data.displayName;
    }

    this.board = function(data)
    {
        return this.boards(data).first();
    }

    this.boards = function(data)
    {
        if(!this.board_list)
        {
            this.board_list= new IterableCollection(TrelloApi.get("organizations/"+this.data.id+"/boards?filter=open&fields=all")).transform(function(elem)
            {
                return new Board(elem);
            });
        }

        return this.board_list.findByName(data);
    }

    this.load = function()
    {
        this.board_list = null;
        this.data = TrelloApi.get("organizations/"+this.data.id);
        return this;
    }
}
