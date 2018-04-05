var Team = function(data)
{    
    this.data          = data;
  
    this.name = function()
    {
        if(!this.data.displayName)
            this.load();

        return this.data.displayName;
    }
    
    this.load = function()
    {
        this.data = TrelloApi.get("organizations/"+this.data.id);
        return this;
    }
}
