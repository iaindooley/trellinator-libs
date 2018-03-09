var Member = function(data)
{    
    this.data      = data;
  
    this.fullName = function()
    {
        if(!this.data.fullName)
            this.load();

        return this.data.fullName;
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
        this.data = TrelloApi.get("members/"+this.data.id+"?fields=id,username,fullName");
        return this;
    }
}
